SELECT
    pg_get_functiondef(p.oid)
FROM
    pg_proc p
JOIN
    pg_namespace n ON p.pronamespace = n.oid
WHERE
    p.proname = 'borrar_archivo_quill'
    AND n.nspname = 'public';
    
--agrega las columnas para ordenar los archivos y las carpetas
ALTER TABLE public.filesquill
ADD COLUMN "order" BIGINT NOT NULL DEFAULT 0;

ALTER TABLE public.folders
ADD COLUMN "order" BIGINT NOT NULL DEFAULT 0;


--Eliminar el trigger actual
DROP TRIGGER before_insert_or_update_folder ON public.folders;

CREATE TRIGGER before_insert_or_update_folder
BEFORE INSERT OR UPDATE OF name, container
ON public.folders
FOR EACH ROW
EXECUTE FUNCTION check_folder_constraints();

select * from public.filesquill where id = 'b60f19aa-123d-4066-9f06-0c203f38f5f6';


drop function if exists public.getfoldercontentquill;
CREATE OR REPLACE FUNCTION public.getfoldercontentquill(
    p_folder_id UUID,
    p_slug TEXT
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    type INTEGER,
    published BOOLEAN,
    filesNumber VARCHAR,
    "order" BIGINT
)
LANGUAGE plpgsql
AS $$



DECLARE
    p_organization_id UUID;
BEGIN
    -- obtengo el id de la organizacion usando el slug
    SELECT o.id INTO p_organization_id FROM public.organizations o WHERE o.slug = p_slug;


    RETURN QUERY
    SELECT
        f.id AS id,
        f.name AS name,
        1 AS type,
        false AS published,
         (
            WITH RECURSIVE subfolders AS (
                SELECT 
                    folders.id  -- Calificar con el nombre de la tabla
                FROM folders 
                WHERE folders.container = f.id  -- f es el alias de la consulta externa
                UNION ALL
                SELECT 
                    fsub.id  -- Calificar con alias de tabla
                FROM folders fsub
                INNER JOIN subfolders s ON fsub.container = s.id
            )
            SELECT COUNT(*)::VARCHAR
            FROM public.filesquill
            WHERE 
                container = f.id 
                OR container IN (
                    SELECT subfolders.id  -- Calificar con el nombre del CTE
                    FROM subfolders
                )
        ) AS filesNumber,
        f."order" as "order"
    FROM public.folders f
    WHERE
        (p_folder_id IS NULL AND f.container IS NULL AND f.organization_id = p_organization_id)  -- Manejo de NULL
        OR f.container = p_folder_id                   -- Caso normal
    
    UNION ALL
    
    SELECT
        a.id AS id,
        a.name AS name,
        0 AS type,
        a.published AS published,
        '0' as filesNumber,
        a."order" as "order"
    FROM public.filesquill a
    WHERE
        (p_folder_id IS NULL AND a.container IS NULL AND a.organization_id = p_organization_id)  -- Manejo de NULL
        OR a.container = p_folder_id;                  -- Caso normal
END;


$$;



drop function if exists public.getrootcontentquillfiltered;
CREATE OR REPLACE FUNCTION public.getrootcontentquillfiltered(
    p_slug TEXT
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    type INTEGER,
    published BOOLEAN,
    filesNumber VARCHAR,
    "order" BIGINT
)
LANGUAGE plpgsql
AS $$


DECLARE
    p_organization_id UUID;
BEGIN

    -- Se obtiene el id de la organizacion usando el slug
    SELECT o.id INTO p_organization_id FROM public.organizations o WHERE o.slug = p_slug;
    -- Retornar resultados filtrados

    RETURN QUERY
    SELECT
        f.id,
        f.name,
        1::integer,
        false,
            (
            WITH RECURSIVE subfolders AS (
                SELECT 
                    folders.id  -- Calificar con el nombre de la tabla
                FROM folders 
                WHERE folders.container = f.id  -- f es el alias de la consulta externa
                UNION ALL
                SELECT 
                    fsub.id  -- Calificar con alias de tabla
                FROM folders fsub
                INNER JOIN subfolders s ON fsub.container = s.id
            )

            SELECT COUNT(*)::VARCHAR
            FROM public.filesquill
            WHERE 
                container = f.id 
                OR container IN (
                    SELECT subfolders.id  -- Calificar con el nombre del CTE
                    FROM subfolders
                )
        ) AS filesNumber,
         f."order" as "order"
    FROM public.folders f
    WHERE
        f.organization_id = p_organization_id AND
        f.container IS NULL
    UNION ALL
    SELECT
        a.id,
        a.name,
        0::integer,
        a.published,
        '0' as filesNumber,
        a."order" as "order"
    FROM public.filesquill a
    WHERE
        a.organization_id = p_organization_id AND
        a.container IS NULL;
END;


$$;



DROP function if exists public.move_file_quill;
CREATE OR REPLACE FUNCTION public.move_file_quill(p_file_id uuid, p_new_container_id uuid)
RETURNS TABLE(itemid uuid, name character varying, container_id uuid, old_container_id uuid, old_container_empty boolean, type integer, published boolean,"order" BIGINT)
LANGUAGE plpgsql
AS $function$

DECLARE
  v_old_container_id UUID;
  v_old_container_empty BOOLEAN;

BEGIN
    -- 1. Obtener el contenedor actual de la carpeta y almacenarlo en una variable
    SELECT f.container INTO v_old_container_id
    FROM public.filesquill f
    WHERE f.id = p_file_id;
    -- 2. Mover la carpeta actualizando el campo 'container'
    UPDATE public.filesquill
    SET container = p_new_container_id
    WHERE id = p_file_id;

    -- 3. Comprobar en la tabla de archivos si el contenedor de origen está vacío

    IF v_old_container_id IS NOT NULL THEN

        SELECT NOT EXISTS (
            SELECT 1 FROM public.folders WHERE container = v_old_container_id
             UNION ALL
            SELECT 1 FROM public.filesquill WHERE container = v_old_container_id
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
        false as published,
        f."order" as "order"

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
        a.published as published,
        a."order" as "order"
    FROM public.filesquill a
    WHERE
        a.container = v_old_container_id OR a.container = p_new_container_id;

END;

$function$




drop function if exists public.move_file_to_root_quill;
CREATE OR REPLACE FUNCTION public.move_file_to_root_quill(p_file_id uuid)
 RETURNS TABLE(itemid uuid, name character varying, container_id uuid, old_container_id uuid, old_container_empty boolean, type integer, published boolean, filesnumber character varying, "order" BIGINT)
 LANGUAGE plpgsql
AS $function$

DECLARE
    v_old_container_id UUID;
    v_old_container_empty BOOLEAN;
BEGIN

    -- 1. Obtener el contenedor actual del archivo y almacenarlo en una variable
    SELECT f.container INTO v_old_container_id
    FROM public.filesquill f
    WHERE f.id = p_file_id;

    -- 2. Mover el archivo al root

    UPDATE public.filesquill
    SET container = NULL
    WHERE id = p_file_id;

    -- 3. Comprobar si el contenedor de origen está vacío

    IF v_old_container_id IS NOT NULL THEN
        SELECT NOT EXISTS (
            SELECT 1 FROM public.folders WHERE container = v_old_container_id
            UNION ALL
            SELECT 1 FROM public.filesquill WHERE container = v_old_container_id
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
            FALSE AS published,
            (
            WITH RECURSIVE subfolders AS (
                SELECT 
                    folders.id  -- Calificar con el nombre de la tabla
                FROM folders 
                WHERE folders.container = f.id  -- f es el alias de la consulta externa
                UNION ALL
                SELECT 
                    fsub.id  -- Calificar con alias de tabla
                FROM folders fsub
                INNER JOIN subfolders s ON fsub.container = s.id

            )

            SELECT COUNT(*)::VARCHAR
            FROM public.filesquill
            WHERE 
                container = f.id 
                OR container IN (
                    SELECT subfolders.id  -- Calificar con el nombre del CTE
                    FROM subfolders

                )

        ) AS filesNumber,
        f."order" as "order"

        FROM
            public.folders f
        WHERE
            (v_old_container_id IS NULL AND f.container IS NULL) 
            OR f.container = v_old_container_id                   

        UNION ALL

        SELECT
            a.id AS itemId,
            a.name AS name,
            a.container AS container_id,
            v_old_container_id AS old_container_id,
            v_old_container_empty AS old_container_empty,
            0 AS type,
            a.published AS published,
            '0' as filesNumber,
            a."order" as "order"

        FROM
            public.filesquill a

        WHERE
            (v_old_container_id IS NULL AND a.container IS NULL) 
            OR a.container = v_old_container_id                   

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
        FALSE AS published,
        '0' as filesNumber,
        0 as "order"
    WHERE NOT EXISTS (SELECT 1 FROM combined);

END;

$function$
















drop function if exists public.mover_carpeta;
CREATE OR REPLACE FUNCTION public.mover_carpeta(p_folder_id uuid, p_new_container_id uuid)
 RETURNS TABLE(itemid uuid, name character varying, container_id uuid, old_container_id uuid, old_container_empty boolean, type integer, published boolean, "order" BIGINT)
 LANGUAGE plpgsql
AS $function$

DECLARE
    v_old_container_id UUID;
    v_old_container_empty BOOLEAN;

BEGIN

    -- 1. Obtener el contenedor actual de la carpeta y almacenarlo en una variable

    SELECT f.container INTO v_old_container_id
    FROM public.folders f
    WHERE f.id = p_folder_id;



    -- 2. Mover la carpeta actualizando el campo 'container'

    UPDATE public.folders
    SET container = p_new_container_id
    WHERE id = p_folder_id;



    -- 3. Comprobar si el contenedor de origen está vacío

    IF v_old_container_id IS NOT NULL THEN

        SELECT NOT EXISTS (
            SELECT 1 FROM public.folders WHERE container = v_old_container_id
            UNION ALL
            SELECT 1 FROM public.filesquill WHERE container = v_old_container_id
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
        1 AS type,
        FALSE AS published,
        f."order" as "order"

    FROM
        public.folders f
    WHERE
        (v_old_container_id IS NOT NULL AND f.container = v_old_container_id)
        OR (p_new_container_id IS NOT NULL AND f.container = p_new_container_id)
    UNION ALL

    SELECT
        a.id AS itemId,
        a.name AS name,
        a.container AS container_id,
        v_old_container_id AS old_container_id,
        v_old_container_empty AS old_container_empty,
        0 AS type,
        a.published AS published,
        a."order" as "order"

    FROM
        public.filesquill a

    WHERE
        (v_old_container_id IS NOT NULL AND a.container = v_old_container_id)
        OR (p_new_container_id IS NOT NULL AND a.container = p_new_container_id);
END;

$function$












--move folder to root
DROP function if exists public.move_folder_to_root;
CREATE OR REPLACE FUNCTION public.move_folder_to_root(p_folder_id uuid)
 RETURNS TABLE(itemid uuid, name character varying, container_id uuid, old_container_id uuid, old_container_empty boolean, type integer, published boolean, "order" BIGINT)
 LANGUAGE plpgsql
AS $function$

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
            SELECT 1 FROM public.filesquill WHERE container = v_old_container_id
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
            FALSE AS published,
            f."order" as "order"

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
            a.published AS published,
            a."order" as "order"
        FROM
            public.filesquill a
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
        FALSE AS published,
        0 as "order"
        
    WHERE NOT EXISTS (SELECT 1 FROM combined);

END;

$function$;




drop function if exists public.borrar_carpeta;
CREATE OR REPLACE FUNCTION public.borrar_carpeta(p_folder_id uuid)
 RETURNS TABLE(itemid uuid, name character varying, container_id uuid, old_container_id uuid, old_container_empty boolean, type integer, published boolean, "order" BIGINT)
 LANGUAGE plpgsql
AS $function$

DECLARE
    v_old_container_id UUID;
    v_old_container_empty BOOLEAN;
BEGIN

    -- 1. Obtener el contenedor actual de la carpeta

    SELECT container INTO v_old_container_id
    FROM public.folders
    WHERE id = p_folder_id;



    -- 2. Borrar la carpeta

    DELETE FROM public.folders WHERE id = p_folder_id;

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



    -- 4. Retornar al menos una fila con los metadatos

    RETURN QUERY

    WITH items AS (

        -- Carpetas en el contenedor original

        SELECT
            f.id,
            f.name,
            f.container,
            1 AS type,
            FALSE AS published,
            f."order" as "order"
        FROM public.folders f
        WHERE f.container IS NOT DISTINCT FROM v_old_container_id
        UNION ALL

        -- Archivos en el contenedor original

        SELECT
            a.id,
            a.name,
            a.container,
            0 AS type,
            a.published,
            a."order" as "order"

        FROM public.filesquill a

        WHERE a.container IS NOT DISTINCT FROM v_old_container_id

    )

    SELECT
        i.id::UUID,
        i.name::VARCHAR,
        i.container::UUID,
        v_old_container_id,
        v_old_container_empty,
        i.type::integer,
        i.published::boolean,
        i."order"::bigint

    FROM items i

    UNION ALL

    SELECT
        NULL,  -- itemId
        NULL,  -- name
        NULL,  -- container_id
        v_old_container_id,
        v_old_container_empty,
        NULL,  -- type
        NULL,   -- published
        0

    WHERE NOT EXISTS (SELECT 1 FROM items);  -- Solo si no hay registros

END;

$function$



drop function if exists public.borrar_archivo_quill;
CREATE OR REPLACE FUNCTION public.borrar_archivo_quill(p_file_id uuid)
 RETURNS TABLE(itemid uuid, name character varying, container_id uuid, old_container_id uuid, old_container_empty boolean, type integer, published boolean, "order" BIGINT)
 LANGUAGE plpgsql
AS $function$

DECLARE
    v_old_container_id UUID;
    v_old_container_empty BOOLEAN;

BEGIN

    -- 1. Obtener el contenedor actual del archivo
    SELECT container INTO v_old_container_id
    FROM public.filesquill
    WHERE id = p_file_id;



    -- 2. Borrar la carpeta

    DELETE FROM public.filesquill WHERE id = p_file_id;



    -- 3. Comprobar si el contenedor de origen está vacío

    IF v_old_container_id IS NOT NULL THEN

        SELECT NOT EXISTS (
            SELECT 1 FROM public.folders WHERE container = v_old_container_id
            UNION ALL
            SELECT 1 FROM public.filesquill WHERE container = v_old_container_id
        ) INTO v_old_container_empty;

    ELSE
        v_old_container_empty := NULL;
    END IF;



    -- 4. Retornar al menos una fila con los metadatos

    RETURN QUERY

    WITH items AS (

        -- Carpetas en el contenedor original

        SELECT
            f.id,
            f.name,
            f.container,
            1 AS type,
            FALSE AS published,
            f."order" as "order"

        FROM public.folders f
        WHERE f.container IS NOT DISTINCT FROM v_old_container_id
        UNION ALL

        -- Archivos en el contenedor original

        SELECT
            a.id,
            a.name,
            a.container,
            0 AS type,
            a.published,
            a."order" as "order"

        FROM public.filesquill a

        WHERE a.container IS NOT DISTINCT FROM v_old_container_id

    )

    SELECT

        i.id::UUID,
        i.name::VARCHAR,
        i.container::UUID,
        v_old_container_id,
        v_old_container_empty,
        i.type::integer,
        i.published::boolean,
        i."order"::bigint

    FROM items i

    UNION ALL

    SELECT

        NULL,  -- itemId
        NULL,  -- name
        NULL,  -- container_id
        v_old_container_id,
        v_old_container_empty,
        NULL,  -- type
        NULL,   -- published
        0

    WHERE NOT EXISTS (SELECT 1 FROM items);  -- Solo si no hay registros

END;

$function$
