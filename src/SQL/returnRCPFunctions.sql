
-- regresa la lista de funciones en la base de datos excluyendo las funciones del sistema y las funciones de extensiones comunes
-- obtiene el código fuente de la función pública 'get_user_organizations'
SELECT
    routine_name AS function_name,
    routine_schema AS schema
FROM
    information_schema.routines
WHERE
    routine_type = 'FUNCTION'
    AND routine_schema NOT IN ('pg_catalog', 'information_schema', 'auth', 'extensions', 'graphql', 'realtime', 'storage');

    SELECT
  pg_get_functiondef('public.get_user_organizations'::regproc);