CREATE OR REPLACE FUNCTION getfolderContent(p_folder_id UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    type integer,
    published boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id AS id,
        f.name AS name,
        1 AS type,
        false AS published 
    FROM public.folders f
    WHERE
        (p_folder_id IS NULL AND f.container IS NULL)  
        OR f.container = p_folder_id                 
    
    UNION ALL
    
    SELECT
        a.id AS id,
        a.name AS name,
        0 AS type,
        a.published AS published  
    FROM public.files a
    WHERE
        (p_folder_id IS NULL AND a.container IS NULL)  
        OR a.container = p_folder_id;                  
END;
$$ LANGUAGE plpgsql;

-- DROP FUNCTION getfolderContent;


SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public';

SELECT * FROM getfoldercontent(null);