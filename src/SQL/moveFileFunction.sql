DROP FUNCTION IF EXISTS move_file;

CREATE OR REPLACE FUNCTION move_file(p_file_id UUID, p_new_container_id UUID)
RETURNS TABLE (
    itemId UUID,
    name VARCHAR,
    container_id UUID,
    old_container_id UUID,
    old_container_empty BOOLEAN,
    type integer,
    published boolean
    
) AS $$
DECLARE
    v_old_container_id UUID;
    v_old_container_empty BOOLEAN;
BEGIN
    -- 1. Obtener el contenedor actual de la carpeta y almacenarlo en una variable
    SELECT f.container INTO v_old_container_id
    FROM public.files f
    WHERE f.id = p_file_id;

    -- 2. Mover la carpeta actualizando el campo 'container'
    UPDATE public.files
    SET container = p_new_container_id
    WHERE id = p_file_id;

    -- 3. Comprobar si el contenedor de origen está vacío
    IF v_old_container_id IS NOT NULL THEN
        SELECT NOT EXISTS (
            SELECT 1 FROM public.folders WHERE container = v_old_container_id
        ) INTO v_old_container_empty;
    ELSE
        v_old_container_empty := NULL;
    END IF;

    -- 4. Retornar el contenido de los contenedores de origen y destino, y si el contenedor de origen está vacío
    RETURN QUERY
    SELECT
        f.id AS itemId,
        f.name AS name,
        f.container AS container_id,
        v_old_container_id AS old_container_id,
        v_old_container_empty AS old_container_empty,
        1 as type,
        false as published
    FROM public.folders f
    WHERE
        f.container = v_old_container_id OR f.container = p_new_container_id
    UNION ALL 
       SELECT
        a.id AS itemId,
        a.name AS name,
        a.container AS container_id,
        v_old_container_id AS old_container_id,
        v_old_container_empty AS old_container_empty,
        0 as type,
        a.published as published
    FROM public.files a
    WHERE
        a.container = v_old_container_id OR a.container = p_new_container_id;

END;
$$ LANGUAGE plpgsql;



