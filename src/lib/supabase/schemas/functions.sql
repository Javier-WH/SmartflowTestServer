-- ========================================
-- FUNCTIONS SCHEMA
-- ========================================
-- This file contains all stored procedures and functions organized by domain

-- ========================================
-- FOLDER OPERATIONS
-- ========================================

-- Update folder name and return container contents
CREATE OR REPLACE FUNCTION "public"."actualizar_carpeta"("p_foldername" character varying, "p_id" "uuid") RETURNS TABLE("itemid" "uuid", "name" character varying, "container_id" "uuid", "type" integer, "published" boolean)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    p_container_id UUID;  
BEGIN
    -- 1. Obtener el container id de la carpeta
    SELECT container INTO STRICT p_container_id
    FROM public.folders
    WHERE id = p_id;
 
    -- 2. Actualizar el nombre de la carpeta (sintaxis corregida)
    UPDATE public.folders
    SET name = p_folderName  
    WHERE id = p_id;
 
    -- 3. Retornar el contenido del contenedor
    RETURN QUERY
    SELECT
        f.id AS itemId,
        f.name AS name,
        f.container AS container_id,
        1 AS type,
        FALSE AS published
    FROM public.folders f
    WHERE f.container IS NOT DISTINCT FROM p_container_id
    UNION ALL
    SELECT
        a.id AS itemId,
        a.name AS name,
        a.container AS container_id,
        0 AS type,
        a.published AS published
    FROM public.filesquill a
    WHERE a.container IS NOT DISTINCT FROM p_container_id;
END;
$$;

-- Update root folder name and return root contents
CREATE OR REPLACE FUNCTION "public"."actualizar_carpeta_root"("p_foldername" character varying, "p_id" "uuid") RETURNS TABLE("itemid" "uuid", "name" character varying, "container_id" "uuid", "type" integer, "published" boolean)
    LANGUAGE "plpgsql"
    AS $$
 
BEGIN
    -- 1. Actualizar el nombre de la carpeta (sintaxis corregida)
    UPDATE public.folders
    SET name = p_folderName  
    WHERE id = p_id;
 
    -- 2. Retornar el contenido del contenedor
    RETURN QUERY
    SELECT
        f.id AS itemId,
        f.name AS name,
        f.container AS container_id,
        1 AS type,
        FALSE AS published
    FROM public.folders f
    WHERE f.container IS NULL
    UNION ALL
    SELECT
        a.id AS itemId,
        a.name AS name,
        a.container AS container_id,
        0 AS type,
        a.published AS published
    FROM public.files a
    WHERE a.container IS NULL;
END;
$$;

-- Create new folder
CREATE OR REPLACE FUNCTION "public"."crear_carpeta"("p_foldername" character varying, "p_container_id" "uuid", "p_slug" "text") RETURNS TABLE("itemid" "uuid", "name" character varying, "container_id" "uuid", "type" integer, "published" boolean)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    p_organization_id UUID;
BEGIN
    -- 0. Obtener el ID de la organizacion
    SELECT o.id INTO p_organization_id FROM public.organizations o WHERE o.slug = p_slug;
 
    -- 1. Insertar la carpeta
    INSERT INTO public.folders (name, container, organization_id) 
    VALUES (p_folderName, p_container_id, p_organization_id);
 
    -- 2. Retornar el contenido del contenedor
    RETURN QUERY
    SELECT
        f.id AS itemId,
        f.name AS name,
        f.container AS container_id,
        1 AS type,  
        FALSE AS published
    FROM
        public.folders f
    WHERE
        f.container IS NOT DISTINCT FROM p_container_id  
    UNION ALL
    SELECT
        a.id AS itemId,
        a.name AS name,
        a.container AS container_id,
        0 AS type,
        a.published AS published
    FROM
        public.filesquill a
    WHERE
        a.container IS NOT DISTINCT FROM p_container_id;  
END;
$$;

-- Delete folder
CREATE OR REPLACE FUNCTION "public"."borrar_carpeta"("p_folder_id" "uuid") RETURNS TABLE("itemid" "uuid", "name" character varying, "container_id" "uuid", "old_container_id" "uuid", "old_container_empty" boolean, "type" integer, "published" boolean)
    LANGUAGE "plpgsql"
    AS $$
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
            FALSE AS published
        FROM public.folders f
        WHERE f.container IS NOT DISTINCT FROM v_old_container_id
        UNION ALL
        -- Archivos en el contenedor original
        SELECT
            a.id,
            a.name,
            a.container,
            0 AS type,
            a.published
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
        i.published::boolean
    FROM items i
    UNION ALL
    SELECT
        NULL,  -- itemId
        NULL,  -- name
        NULL,  -- container_id
        v_old_container_id,
        v_old_container_empty,
        NULL,  -- type
        NULL   -- published
    WHERE NOT EXISTS (SELECT 1 FROM items);  -- Solo si no hay registros
END;
$$;

-- Move folder to another container
CREATE OR REPLACE FUNCTION "public"."mover_carpeta"("p_folder_id" "uuid", "p_new_container_id" "uuid") RETURNS TABLE("itemid" "uuid", "name" character varying, "container_id" "uuid", "old_container_id" "uuid", "old_container_empty" boolean, "type" integer, "published" boolean)
    LANGUAGE "plpgsql"
    AS $$
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
        FALSE AS published
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
        a.published AS published
    FROM
        public.filesquill a
    WHERE
        (v_old_container_id IS NOT NULL AND a.container = v_old_container_id)
        OR (p_new_container_id IS NOT NULL AND a.container = p_new_container_id);
END;
$$;

-- Move folder to root
CREATE OR REPLACE FUNCTION "public"."move_folder_to_root"("p_folder_id" "uuid") RETURNS TABLE("itemid" "uuid", "name" character varying, "container_id" "uuid", "old_container_id" "uuid", "old_container_empty" boolean, "type" integer, "published" boolean)
    LANGUAGE "plpgsql"
    AS $$
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
$$;

-- ========================================
-- FILE OPERATIONS
-- ========================================

CREATE OR REPLACE FUNCTION "public"."create_file_quill"("p_name" character varying, "p_container" "uuid" DEFAULT NULL::"uuid", "p_slug" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  new_id uuid;
  p_organization_id uuid;
BEGIN
  -- obtener el organization_Id usando el slug
    SELECT o.id INTO p_organization_id FROM public.organizations o WHERE o.slug =  p_slug;

  -- Insertar el registro manejando el caso especial para container
  INSERT INTO public.filesquill(name, container, organization_id, content)
  VALUES (
    p_name,
    CASE 
      WHEN p_container IS NULL THEN NULL
      ELSE p_container
    END,
    p_organization_id,
    '<p><br></p><guided-checklist class="guided-checklist-block" title="" items="[{&quot;id&quot;:&quot;fd2390ff-4643-4dd1-9622-9f5061186ea7&quot;,&quot;index&quot;:0,&quot;text&quot;:&quot;&quot;,&quot;guidande&quot;:&quot;&quot;}]" contenteditable="false" readonly="false"></guided-checklist><p><br></p><p><br></p>'
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."duplicate_filesquill_record"("p_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_id UUID;
    container_id UUID;
BEGIN
    -- Inserta un nuevo registro con los mismos datos del original,
    -- excepto el id, created_at, y updated_at,
    -- y almacena el container en una variable.

    INSERT INTO public.filesquill (
        id,
        name,
        container,
        content,
        published,
        organization_id
    )
    SELECT
        gen_random_uuid(),
        name,
        container,
        content,
        published,
        organization_id
    FROM
        public.filesquill
    WHERE
        id = p_id
    RETURNING
        container INTO container_id;

    -- Retorna el container del registro duplicado.
    RETURN container_id;
END;
$$;

-- Delete basic file
CREATE OR REPLACE FUNCTION "public"."borrar_archivo"("p_file_id" "uuid") RETURNS TABLE("itemid" "uuid", "name" character varying, "container_id" "uuid", "old_container_id" "uuid", "old_container_empty" boolean, "type" integer, "published" boolean)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_old_container_id UUID;
    v_old_container_empty BOOLEAN;
BEGIN
    -- 1. Obtener el contenedor actual del archivo
    SELECT container INTO v_old_container_id
    FROM public.files
    WHERE id = p_file_id;
 
    -- 2. Borrar la carpeta
    DELETE FROM public.files WHERE id = p_file_id;
 
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
            FALSE AS published
        FROM public.folders f
        WHERE f.container IS NOT DISTINCT FROM v_old_container_id
        UNION ALL
        -- Archivos en el contenedor original
        SELECT
            a.id,
            a.name,
            a.container,
            0 AS type,
            a.published
        FROM public.files a
        WHERE a.container IS NOT DISTINCT FROM v_old_container_id
    )
    SELECT
        i.id::UUID,
        i.name::VARCHAR,
        i.container::UUID,
        v_old_container_id,
        v_old_container_empty,
        i.type::integer,
        i.published::boolean
    FROM items i
    UNION ALL
    SELECT
        NULL,  -- itemId
        NULL,  -- name
        NULL,  -- container_id
        v_old_container_id,
        v_old_container_empty,
        NULL,  -- type
        NULL   -- published
    WHERE NOT EXISTS (SELECT 1 FROM items);  -- Solo si no hay registros
END;
$$;

-- Delete Quill file
CREATE OR REPLACE FUNCTION "public"."borrar_archivo_quill"("p_file_id" "uuid") RETURNS TABLE("itemid" "uuid", "name" character varying, "container_id" "uuid", "old_container_id" "uuid", "old_container_empty" boolean, "type" integer, "published" boolean)
    LANGUAGE "plpgsql"
    AS $$
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
            FALSE AS published
        FROM public.folders f
        WHERE f.container IS NOT DISTINCT FROM v_old_container_id
        UNION ALL
        -- Archivos en el contenedor original
        SELECT
            a.id,
            a.name,
            a.container,
            0 AS type,
            a.published
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
        i.published::boolean
    FROM items i
    UNION ALL
    SELECT
        NULL,  -- itemId
        NULL,  -- name
        NULL,  -- container_id
        v_old_container_id,
        v_old_container_empty,
        NULL,  -- type
        NULL   -- published
    WHERE NOT EXISTS (SELECT 1 FROM items);  -- Solo si no hay registros
END;
$$;

CREATE OR REPLACE FUNCTION "public"."generate_random_string"("length" integer) RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."get_folder_path_contents"("p_folder_id" "uuid") RETURNS TABLE("id" "uuid", "name" character varying, "type" integer, "published" boolean)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    path_ids UUID[];
BEGIN
    -- CTE con alias explcitos para evitar ambigedades
    WITH RECURSIVE folder_path AS (
        SELECT 
            f.id AS folder_id,  -- Alias nico
            f.container
        FROM public.folders f
        WHERE f.id = p_folder_id  -- Cualificado con alias de tabla

        UNION ALL

        SELECT 
            f.id AS folder_id,  -- Mismo alias en recursivo
            f.container
        FROM public.folders f
        INNER JOIN folder_path fp ON f.id = fp.container
    )
    SELECT ARRAY_AGG(folder_id) INTO path_ids  -- Usamos el alias
    FROM folder_path
    WHERE folder_id <> p_folder_id;  -- Referencia no ambigua

    path_ids := ARRAY_REVERSE(path_ids);

    IF array_length(path_ids, 1) > 0 THEN
        IF (SELECT container FROM public.folders WHERE id = path_ids[1]) IS NULL THEN
            path_ids := path_ids[2:];
        END IF;
    END IF;

    RETURN QUERY
    SELECT gc.id, gc.name, gc.type, gc.published
    FROM unnest(path_ids) AS current_folder_id  -- Alias nico
    CROSS JOIN LATERAL getfolderContent(current_folder_id) AS gc;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."get_user_organizations"("p_user_id" "uuid", "p_name" "text" DEFAULT NULL::"text", "p_page" integer DEFAULT 1, "p_page_size" integer DEFAULT 10) RETURNS TABLE("id" "uuid", "name" character varying, "description" "text", "slug" character varying, "open" boolean, "created_at" timestamp with time zone, "user_id" "uuid", "is_creator" boolean, "is_member" boolean, "leveltitle" character varying, "read" boolean, "write" boolean, "delete" boolean, "invite" boolean, "configure" boolean, "total_count" bigint)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_start INTEGER;
  v_end INTEGER;
  v_total_count BIGINT;
BEGIN
  -- Calculate pagination
  v_start := (p_page - 1) * p_page_size;
  
  -- Get the total count first
  SELECT COUNT(DISTINCT o.id) INTO v_total_count
  FROM organizations o
  LEFT JOIN organizations_users ou ON o.id = ou.organization_id
  WHERE o.open = true
    AND (o.user_id = p_user_id OR ou.user_id = p_user_id)
    AND (p_name IS NULL OR o.name ILIKE '%' || p_name || '%');
  
  -- Return the organizations with pagination
  RETURN QUERY
  WITH user_orgs AS (
    SELECT DISTINCT ON (o.id)
      o.id,
      o.name,
      o.description,
      o.slug,
      o.open,
      o.created_at,
      o.user_id,
      (o.user_id = p_user_id) AS is_creator,
      (ou.user_id IS NOT NULL) AS is_member,
      roll.level,
      roll.read,
      roll.write,
      roll.delete,
      roll.invite,
      roll.configure
    FROM organizations o
    LEFT JOIN organizations_users ou ON o.id = ou.organization_id AND ou.user_id = p_user_id
    LEFT JOIN rolls roll ON roll.id = ou.roll_id
    WHERE o.open = true
      AND (o.user_id = p_user_id OR ou.user_id = p_user_id)
      AND (p_name IS NULL OR o.name ILIKE '%' || p_name || '%')
    ORDER BY o.id, o.created_at DESC
  )
  SELECT 
    uo.*,
    v_total_count AS total_count
  FROM user_orgs uo
  ORDER BY uo.created_at DESC
  LIMIT p_page_size
  OFFSET v_start;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."getfilescount"("p_folder_id" "uuid") RETURNS TABLE("filesnumber" character varying)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE subfolders AS (
        SELECT 
            id
        FROM public.folders
        WHERE id = p_folder_id  -- Inicia desde la carpeta especificada
        
        UNION ALL
        
        SELECT 
            f.id
        FROM public.folders f
        INNER JOIN subfolders s 
            ON f.container = s.id  -- Recursividad hacia subcarpetas
    )
    SELECT 
        COUNT(*)::VARCHAR
    FROM public.filesquill
    WHERE container IN (SELECT id FROM subfolders);  -- Archivos en cualquier nivel

END;
$$;

CREATE OR REPLACE FUNCTION "public"."getfoldercontentquill"("p_folder_id" "uuid", "p_slug" "text") RETURNS TABLE("id" "uuid", "name" character varying, "type" integer, "published" boolean, "filesnumber" character varying)
    LANGUAGE "plpgsql"
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
        ) AS filesNumber
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
        '0' as filesNumber 
    FROM public.filesquill a
    WHERE
        (p_folder_id IS NULL AND a.container IS NULL AND a.organization_id = p_organization_id)  -- Manejo de NULL
        OR a.container = p_folder_id;                  -- Caso normal
END;
$$;

CREATE OR REPLACE FUNCTION "public"."gethierarchyfoldercontent"("p_folder_id" "uuid", "p_slug" "text") RETURNS TABLE("itemid" "uuid", "name" character varying, "type" integer, "published" boolean, "level" integer, "container_id" "uuid")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    curr_folder_id UUID;         -- Folder actual en el recorrido
    parent_folder_id UUID;       -- Contenedor del folder actual
    ancestors UUID[] := ARRAY[]::UUID[];  -- Acumula los id de los padres
    i INT;
    rev_array UUID[];            -- Arreglo invertido de ancestros
BEGIN
    -- Caso en que no se pasa un id: retornamos el contenido del root
    IF p_folder_id IS NULL THEN
        RETURN QUERY
            SELECT r.id, 
                   r.name, 
                   r.type, 
                   r.published, 
                   0 AS level,
                   NULL AS container
            FROM (
                  SELECT * FROM getRootContentQuill()
            ) r;
        RETURN;
    END IF;
    
    -- Iniciar la bsqueda con la carpeta ingresada
    curr_folder_id := p_folder_id;
    
    LOOP
        SELECT f.container 
          INTO parent_folder_id
        FROM public.folders f
        WHERE f.id = curr_folder_id;
        
        -- Si no hay contenedor, entonces se lleg al global root
        IF parent_folder_id IS NULL THEN
            EXIT;
        END IF;
        
        ancestors := ancestors || parent_folder_id;
        curr_folder_id := parent_folder_id;
    END LOOP;
    
    -- Invertir el arreglo para que el primer elemento sea el de ms alto nivel
    rev_array := (
        SELECT ARRAY(
            SELECT t.x
            FROM unnest(ancestors) WITH ORDINALITY AS t(x, ord)
            ORDER BY t.ord DESC
        )
    );
    
    -- Si no hay ancestros, la carpeta es de primer nivel; se usa el contenido del root
    IF rev_array IS NULL OR array_length(rev_array, 1) = 0 THEN
        RETURN QUERY
            SELECT r.id, 
                   r.name, 
                   r.type, 
                   r.published, 
                   0 AS level,
                   NULL AS container_id
            FROM getRootContentQuill() r;
    ELSE
        -- Por cada nivel de la jerarqua se obtiene su contenido
        -- Se asigna level = (i-1) para que el nivel 0 corresponda al root
        FOR i IN 1..array_length(rev_array, 1) LOOP
            RETURN QUERY
              SELECT r.id,
                     r.name,
                     r.type,
                     r.published,
                     (i - 1) AS level,
                     CASE
                       WHEN r.type = 1 THEN (SELECT f.container FROM public.folders f WHERE f.id = r.id)
                       WHEN r.type = 0 THEN (SELECT a.container FROM public.filesquill a WHERE a.id = r.id)
                     END AS container_id
              FROM getfolderContentQuill(rev_array[i], p_slug) r;
        END LOOP;
    END IF;
    
    RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."getmembers"("a_organization_id" "uuid") RETURNS TABLE("userid" "uuid", "useremail" character varying, "rollid" "uuid", "rollname" character varying)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
    SELECT 
      u.id as userId,
      u.email as userEmail,
      r.id as rollId,
      r.level as rollName
    FROM public.organizations_users ou
    JOIN auth.users u ON ou.user_id = u.id
    JOIN public.rolls r ON ou.roll_id = r.id
    WHERE ou.organization_id = a_organization_id; 
END;
$$;

CREATE OR REPLACE FUNCTION "public"."getrootcontentquill"() RETURNS TABLE("id" "uuid", "name" character varying, "type" integer, "published" boolean, "filesnumber" character varying)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
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
        ) AS filesNumber
    FROM public.folders f
    WHERE f.container IS NULL
    
    UNION ALL
    
    SELECT
        a.id AS id,
        a.name AS name,
        0 AS type,
        a.published AS published,
        '0' as filesNumber 
    FROM public.filesquill a
    WHERE a.container IS NULL;
    
END;
$$;

CREATE OR REPLACE FUNCTION "public"."getrootcontentquillfiltered"("p_slug" "text") RETURNS TABLE("id" "uuid", "name" character varying, "type" integer, "published" boolean, "filesnumber" character varying)
    LANGUAGE "plpgsql"
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
        ) AS filesNumber
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
        '0' as filesNumber 
    FROM public.filesquill a
    WHERE
        a.organization_id = p_organization_id AND
        a.container IS NULL;
        
END;
$$;

CREATE OR REPLACE FUNCTION "public"."is_user_in_organization"("p_email" "text", "p_organization_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_is_member BOOLEAN;
BEGIN
    -- Check if a user with the given email exists AND is in the specified organization.
    -- We join with auth.users to get the user ID from the email.
    SELECT EXISTS (
        SELECT 1
        FROM public.organizations_users AS ou
        INNER JOIN auth.users AS au ON ou.user_id = au.id
        WHERE au.email = p_email AND ou.organization_id = p_organization_id
    ) INTO v_is_member;

    RETURN v_is_member;

EXCEPTION
    -- If any other error occurs, return false.
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."move_file_quill"("p_file_id" "uuid", "p_new_container_id" "uuid") RETURNS TABLE("itemid" "uuid", "name" character varying, "container_id" "uuid", "old_container_id" "uuid", "old_container_empty" boolean, "type" integer, "published" boolean)
    LANGUAGE "plpgsql"
    AS $$
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

    -- 3. Comprobar en la tabla de archivos si el contenedor de origen est vaco
    IF v_old_container_id IS NOT NULL THEN
        SELECT NOT EXISTS (
            SELECT 1 FROM public.folders WHERE container = v_old_container_id
             UNION ALL
            SELECT 1 FROM public.filesquill WHERE container = v_old_container_id
        ) INTO v_old_container_empty;
    ELSE
        v_old_container_empty := NULL;
    END IF;

    -- 4. Retornar el contenido de los contenedores de origen y destino, y si el contenedor de origen est vaco
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
    FROM public.filesquill a
    WHERE
        a.container = v_old_container_id OR a.container = p_new_container_id;

END;
$$;

CREATE OR REPLACE FUNCTION "public"."move_file_to_root_quill"("p_file_id" "uuid") RETURNS TABLE("itemid" "uuid", "name" character varying, "container_id" "uuid", "old_container_id" "uuid", "old_container_empty" boolean, "type" integer, "published" boolean, "filesnumber" character varying)
    LANGUAGE "plpgsql"
    AS $$
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

    -- 3. Comprobar si el contenedor de origen est vaco
    IF v_old_container_id IS NOT NULL THEN
        SELECT NOT EXISTS (
            SELECT 1 FROM public.folders WHERE container = v_old_container_id
            UNION ALL
            SELECT 1 FROM public.filesquill WHERE container = v_old_container_id
        ) INTO v_old_container_empty;
    ELSE
        v_old_container_empty := NULL;
    END IF;

    -- 4. Retornar el contenido de los contenedores de origen y destino, y si el contenedor de origen est vaco
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
        ) AS filesNumber
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
            '0' as filesNumber 
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
        '0' as filesNumber 
    WHERE NOT EXISTS (SELECT 1 FROM combined);
END;
$$;

CREATE OR REPLACE FUNCTION "public"."partial_search_filesquill"("search_term" "text", "p_slug" "uuid") RETURNS TABLE("id" "uuid", "name" character varying, "content" "text", "searchtext" "text", "container" "uuid", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "similarity_score" real, "type" integer)
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    -- Define un lmite para cada subconsulta. Puedes ajustar este valor.
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
    similarity(f.searchable_text, search_term)::float4 AS similarity_score, -- Alias explcito aqu!
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
    similarity(x.name, search_term)::float4 AS similarity_score, -- Alias explcito y clculo de similitud para carpetas!
    0 as type
  FROM public.folders x
  WHERE x.name % search_term AND x.organization_id = p_slug -- Usar operador % de pg_trgm
  ORDER BY similarity_score DESC -- Ahora 'similarity_score' es reconocido
  LIMIT subquery_limit)
  
  -- El ORDER BY y LIMIT final se aplican a la unin de los resultados ya limitados
  ORDER BY similarity_score DESC, type DESC
  LIMIT 100;

END;
$$;

CREATE OR REPLACE FUNCTION "public"."spreadtutorial"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Inserta nuevos registros en la tabla 'organizations_users'.
    -- La insercin se realiza para cada usuario que an no pertenece a la organizacin especificada.
    INSERT INTO public.organizations_users (user_id, organization_id, roll_id)
    SELECT
        u.id,                                     -- El ID del usuario a agregar
        'f47ac10b-58cc-4372-a567-0e02b2c3d479', -- El ID de la organizacin de destino
        '18244be7-6f88-48ff-8bf3-911f1d712618'  -- El ID del rol que se asignar
    FROM
        auth.users u
    WHERE
        -- La clusula 'NOT EXISTS' se asegura de que solo seleccionemos usuarios
        -- que no tengan ya un registro en 'organizations_users' para esta organizacin.
        NOT EXISTS (
            SELECT 1
            FROM public.organizations_users ou
            WHERE ou.user_id = u.id
            AND ou.organization_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
        );
END;
$$;

-- ========================================
-- ORGANIZATION OPERATIONS
-- ========================================

-- Clone entire organization with folders, files, and users
CREATE OR REPLACE FUNCTION "public"."clone_organization"("original_org_id" "uuid", "new_org_name" character varying, "new_org_slug" character varying) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    new_org_id UUID;
    folder_record RECORD;
    file_record RECORD;
    user_record RECORD;
    temp_new_folder_id UUID;  -- Cambié el nombre para evitar ambigüedad
    mapped_folder_id UUID;    -- Variable para el mapeo
    rows_processed INTEGER;
BEGIN
    -- Crear tabla temporal para mapeo de carpetas
    CREATE TEMP TABLE IF NOT EXISTS folder_mapping (
        old_folder_id UUID PRIMARY KEY,
        new_folder_id UUID NOT NULL
    ) ON COMMIT DROP;

    -- 1. Crear nueva organización
    INSERT INTO organizations (name, description, slug, open, user_id)
    SELECT new_org_name, description, new_org_slug, open, user_id
    FROM organizations 
    WHERE id = original_org_id
    RETURNING id INTO new_org_id;

    -- 2. Clonar usuarios de la organización
    INSERT INTO organizations_users (user_id, organization_id, roll_id)
    SELECT user_id, new_org_id, roll_id
    FROM organizations_users 
    WHERE organization_id = original_org_id;

    -- 3. Clonar carpetas usando enfoque recursivo
    -- Primero las carpetas raíz (container IS NULL)
    FOR folder_record IN 
        SELECT * FROM folders 
        WHERE organization_id = original_org_id 
        AND container IS NULL
        ORDER BY created_at
    LOOP
        INSERT INTO folders (name, container, organization_id)
        VALUES (folder_record.name, NULL, new_org_id)
        RETURNING id INTO temp_new_folder_id;
        
        INSERT INTO folder_mapping (old_folder_id, new_folder_id)
        VALUES (folder_record.id, temp_new_folder_id);
    END LOOP;

    -- Luego procesar carpetas anidadas recursivamente
    LOOP
        rows_processed := 0;
        
        -- Insertar carpetas cuyo contenedor ya ha sido mapeado
        FOR folder_record IN 
            SELECT f.* 
            FROM folders f
            WHERE f.organization_id = original_org_id 
            AND f.container IS NOT NULL
            AND f.id NOT IN (SELECT old_folder_id FROM folder_mapping)
            AND f.container IN (SELECT old_folder_id FROM folder_mapping)
        LOOP
            -- Obtener el nuevo ID del contenedor (usando alias para evitar ambigüedad)
            SELECT fm.new_folder_id INTO mapped_folder_id 
            FROM folder_mapping fm
            WHERE fm.old_folder_id = folder_record.container;
            
            INSERT INTO folders (name, container, organization_id)
            VALUES (folder_record.name, mapped_folder_id, new_org_id)
            RETURNING id INTO temp_new_folder_id;
            
            INSERT INTO folder_mapping (old_folder_id, new_folder_id)
            VALUES (folder_record.id, temp_new_folder_id);
            
            rows_processed := rows_processed + 1;
        END LOOP;
        
        -- Salir del bucle cuando no se procesen más filas
        EXIT WHEN rows_processed = 0;
    END LOOP;

    -- 4. Clonar documentos
    FOR file_record IN 
        SELECT f.* 
        FROM filesquill f
        WHERE f.organization_id = original_org_id
    LOOP
        IF file_record.container IS NOT NULL THEN
            SELECT fm.new_folder_id INTO mapped_folder_id
            FROM folder_mapping fm
            WHERE fm.old_folder_id = file_record.container;
        ELSE
            mapped_folder_id := NULL;
        END IF;

        INSERT INTO filesquill (name, container, content, published, organization_id)
        VALUES (
            file_record.name, 
            mapped_folder_id, 
            file_record.content, 
            file_record.published, 
            new_org_id
        );
    END LOOP;

    -- La tabla temporal se eliminará automáticamente al final de la transacción por ON COMMIT DROP
    RETURN new_org_id;
END;
$$;

-- ========================================
-- FILE OPERATIONS (continued)
-- ========================================

-- Create basic file
CREATE OR REPLACE FUNCTION "public"."create_file"("p_name" character varying, "p_container" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  new_id uuid;
BEGIN
  -- Insertar el registro manejando el caso especial para container
  INSERT INTO public.files(name, container)
  VALUES (
    p_name,
    CASE 
      WHEN p_container IS NULL THEN NULL
      ELSE p_container
    END
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Create Quill file (multiple overloads)
CREATE OR REPLACE FUNCTION "public"."create_file_quill"("p_name" character varying, "p_container" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  new_id uuid;
BEGIN
  -- Insertar el registro manejando el caso especial para container
  INSERT INTO public.filesquill(name, container)
  VALUES (
    p_name,
    CASE 
      WHEN p_container IS NULL THEN NULL
      ELSE p_container
    END
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."create_file_quill"("p_name" character varying, "p_container" "uuid" DEFAULT NULL::"uuid", "p_organization_id" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  new_id uuid;
BEGIN
  -- Insertar el registro manejando el caso especial para container
  INSERT INTO public.filesquill(name, container, organization_id)
  VALUES (
    p_name,
    CASE 
      WHEN p_container IS NULL THEN NULL
      ELSE p_container
    END,
    p_organization_id
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Move basic file
CREATE OR REPLACE FUNCTION "public"."move_file"("p_file_id" "uuid", "p_new_container_id" "uuid") RETURNS TABLE("itemid" "uuid", "name" character varying, "container_id" "uuid", "old_container_id" "uuid", "old_container_empty" boolean, "type" integer, "published" boolean)
    LANGUAGE "plpgsql"
    AS $$
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

    -- 3. Comprobar en la tabla de archivos si el contenedor de origen está vacío
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
$$;

-- Move file to root
CREATE OR REPLACE FUNCTION "public"."move_file_to_root"("p_file_id" "uuid") RETURNS TABLE("itemid" "uuid", "name" character varying, "container_id" "uuid", "old_container_id" "uuid", "old_container_empty" boolean, "type" integer, "published" boolean)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_old_container_id UUID;
    v_old_container_empty BOOLEAN;
BEGIN
    -- 1. Obtener el contenedor actual del archivo y almacenarlo en una variable
    SELECT f.container INTO v_old_container_id
    FROM public.files f
    WHERE f.id = p_file_id;

    -- 2. Mover el archivo al root
    UPDATE public.files
    SET container = NULL
    WHERE id = p_file_id;

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
$$;

-- ========================================
-- CONTENT RETRIEVAL FUNCTIONS
-- ========================================

-- Get root content (organization-independent)
CREATE OR REPLACE FUNCTION "public"."getrootcontent"() RETURNS TABLE("id" "uuid", "name" character varying, "type" integer, "published" boolean)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id AS id,
        f.name AS name,
        1 AS type,
        false AS published 
    FROM public.folders f
    WHERE f.container IS NULL
    
    UNION ALL
    
    SELECT
        a.id AS id,
        a.name AS name,
        0 AS type,
        a.published AS published  
    FROM public.files a
    WHERE a.container IS NULL;
    
END;
$$;
