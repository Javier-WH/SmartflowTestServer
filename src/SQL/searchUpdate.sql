SELECT
   pg_get_functiondef(p.oid),
   p.proname
FROM
    pg_proc p
JOIN
    pg_namespace n ON p.pronamespace = n.oid
WHERE
    p.proname = 'partial_search_filesquill'
    AND n.nspname = 'public';





ALTER TABLE public.filesquill DROP COLUMN IF EXISTS searchable_text;

-- Crea una nueva columna computed más eficiente
ALTER TABLE public.filesquill ADD COLUMN searchable_text text GENERATED ALWAYS AS (
  LOWER(
    COALESCE(name, '') || ' ' || 
    COALESCE(regexp_replace(
      regexp_replace(content, '<[^>]+>', ' ', 'gi'), -- Elimina HTML
      '[^\w\sáéíóúÁÉÍÓÚñÑ]', ' ', 'gi' -- Normaliza caracteres especiales
    ), '')
  )
) STORED;




CREATE OR REPLACE FUNCTION public.partial_search_filesquill(search_term text, p_slug uuid)
 RETURNS TABLE(id uuid, name character varying, content text, searchtext text, container uuid, created_at timestamp with time zone, updated_at timestamp with time zone, similarity_score real, type integer)
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
    clean_search_term text;
    words text[];
    subquery_limit CONSTANT INTEGER := 50;
BEGIN
    clean_search_term := LOWER(trim(search_term));
    words := regexp_split_to_array(clean_search_term, '\s+');
    
    RETURN QUERY
    
    (SELECT
        f.id,
        f.name,
        f.content,
        f.searchable_text as searchtext,
        f.container,
        f.created_at,
        f.updated_at,
        (
            similarity(f.searchable_text, clean_search_term) * 0.6 +
            similarity(f.name, clean_search_term) * 1.4 +
            CASE 
                WHEN f.searchable_text ILIKE '%' || clean_search_term || '%' THEN 0.3
                ELSE 0
            END +
            -- Bonus por coincidencia exacta de palabras
            (SELECT COUNT(*) * 0.1 FROM unnest(words) word 
             WHERE f.searchable_text ILIKE '%' || word || '%')
        )::real AS similarity_score,
        1 as type
    FROM public.filesquill f
    WHERE f.organization_id = p_slug
      AND (f.searchable_text %> clean_search_term OR f.name ILIKE '%' || clean_search_term || '%')
    ORDER BY similarity_score DESC
    LIMIT subquery_limit)

    UNION ALL

    (SELECT
        x.id,
        x.name,
        null::text AS content,
        null::text AS searchtext,
        x.container,
        x.created_at,
        null::timestamptz AS updated_at,
        (similarity(x.name, clean_search_term) * 1.5)::real AS similarity_score,
        0 as type
    FROM public.folders x
    WHERE x.organization_id = p_slug
      AND (x.name %> clean_search_term OR x.name ILIKE '%' || clean_search_term || '%')
    ORDER BY similarity_score DESC
    LIMIT subquery_limit)

    ORDER BY similarity_score DESC, type DESC
    LIMIT 100;
END;
$function$;






CREATE OR REPLACE FUNCTION public.partial_search_filesquill(search_term text, p_slug uuid)
 RETURNS TABLE(id uuid, name character varying, content text, searchtext text, container uuid, created_at timestamp with time zone, updated_at timestamp with time zone, similarity_score real, type integer)
 LANGUAGE plpgsql
 STABLE
AS $function$

DECLARE
    -- Define un límite para cada subconsulta. Puedes ajustar este valor.
    -- Un valor de 100 para cada uno asegura que podemos obtener hasta 100 resultados combinados.
    subquery_limit CONSTANT INTEGER := 100;

BEGIN

  RETURN QUERY

  (SELECT
    f.id,
    f.name,
    f.content,
    f.searchable_text, 
    f.container,
    f.created_at,
    f.updated_at,
    similarity(f.searchable_text, search_term)::float4 AS similarity_score, -- ¡Alias explícito aquí!
    1 as type
  FROM public.filesquill f
  WHERE f.searchable_text %> search_term AND f.organization_id = p_slug
  ORDER BY similarity_score DESC -- Ahora 'similarity_score' es reconocido
  LIMIT subquery_limit)

  UNION ALL

  (SELECT
    x.id,
    x.name,
    null::text AS content,        
    null::text AS searchText,        
    x.container,
    x.created_at,
    null::timestamptz AS updated_at, 
    similarity(x.name, search_term)::float4 AS similarity_score, -- ¡Alias explícito y cálculo de similitud para carpetas!
    0 as type
  FROM public.folders x
  WHERE x.name % search_term AND x.organization_id = p_slug -- Usar operador % de pg_trgm
  ORDER BY similarity_score DESC -- Ahora 'similarity_score' es reconocido
  LIMIT subquery_limit)

  

  -- El ORDER BY y LIMIT final se aplican a la unión de los resultados ya limitados

  ORDER BY similarity_score DESC, type DESC
  LIMIT 100;
END;

$function$
