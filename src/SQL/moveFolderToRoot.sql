DROP FUNCTION IF EXISTS move_folder_to_root;

CREATE OR REPLACE FUNCTION move_folder_to_root(p_folder_id UUID)
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
    FROM public.folders f
    WHERE f.id = p_folder_id;

    -- 2. Mover la carpeta al root
    UPDATE public.folders
    SET container = NULL
    WHERE id = p_folder_id;

    -- 3. Comprobar si el contenedor de origen está vacío
    IF v_old_container_id IS NOT NULL THEN
        SELECT NOT EXISTS (
            SELECT 1 FROM public.folders WHERE container = v_old_container_id
            UNION ALL
            SELECT 1 FROM public.files WHERE container = v_old_container_id
        ) INTO v_old_container_empty;
    ELSE
        v_old_container_empty := NULL;
    END IF;

    -- 4. Retornar el contenido de los contenedores de origen y destino, y si el contenedor de origen está vacío
    RETURN QUERY
    WITH combined AS (
        SELECT
            f.id AS itemId,
            f.name AS name,
            f.container AS container_id,
            v_old_container_id AS old_container_id,
            v_old_container_empty AS old_container_empty,
            1 AS type,
            FALSE AS published
        FROM
            public.folders f
        WHERE
            (v_old_container_id IS NULL AND f.container IS NULL)  -- Manejo de NULL
            OR f.container = v_old_container_id                   -- Caso normal
        UNION ALL
        SELECT
            a.id AS itemId,
            a.name AS name,
            a.container AS container_id,
            v_old_container_id AS old_container_id,
            v_old_container_empty AS old_container_empty,
            0 AS type,
            a.published AS published
        FROM
            public.files a
        WHERE
            (v_old_container_id IS NULL AND a.container IS NULL)  -- Manejo de NULL
            OR a.container = v_old_container_id                   -- Caso normal
    )
    SELECT *
    FROM combined
    UNION ALL
    SELECT
        NULL AS itemId,
        'No items found' AS name,
        NULL AS container_id,
        v_old_container_id AS old_container_id,
        v_old_container_empty AS old_container_empty,
        -1 AS type,  -- Tipo ficticio para indicar que no se encontraron elementos
        FALSE AS published
    WHERE NOT EXISTS (SELECT 1 FROM combined);
END;
$$ LANGUAGE plpgsql;



-- SELECT * FROM move_folder_to_root('86cf5f48-3141-4678-a4d7-a05558bd1497');