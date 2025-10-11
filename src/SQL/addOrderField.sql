
--agrega las columnas para ordenar los archivos y las carpetas
ALTER TABLE public.filesquill
ADD COLUMN "order" BIGINT NOT NULL DEFAULT 0;

ALTER TABLE 
ADD COLUMN "order" BIGINT NOT NULL DEFAULT 0;



-- modifica la funcion getfoldercontentquill para agregar el campo order

drop function public.getfoldercontentquill;

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
