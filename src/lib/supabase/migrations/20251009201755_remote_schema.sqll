

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "navigator";


ALTER SCHEMA "navigator" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






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


ALTER FUNCTION "public"."actualizar_carpeta"("p_foldername" character varying, "p_id" "uuid") OWNER TO "postgres";


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


ALTER FUNCTION "public"."actualizar_carpeta_root"("p_foldername" character varying, "p_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."before_insert_organization"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  random_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  -- Generate a random slug and check if it already exists
  LOOP
    -- Generate a random 20-character string
    random_slug := generate_random_string(20);
    
    -- Check if the slug already exists
    SELECT EXISTS(SELECT 1 FROM organizations WHERE slug = random_slug) INTO slug_exists;
    
    -- Exit the loop if the slug is unique
    EXIT WHEN NOT slug_exists;
  END LOOP;
  
  -- Set the slug value
  NEW.slug := random_slug;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."before_insert_organization"() OWNER TO "postgres";


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


ALTER FUNCTION "public"."borrar_archivo"("p_file_id" "uuid") OWNER TO "postgres";


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


ALTER FUNCTION "public"."borrar_archivo_quill"("p_file_id" "uuid") OWNER TO "postgres";


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


ALTER FUNCTION "public"."borrar_carpeta"("p_folder_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_folder_constraints"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  IF NEW.container IS NULL THEN
    PERFORM 1
    FROM public.folders
    WHERE name = NEW.name
    AND organization_id = NEW.organization_id
    AND container IS NULL;
  
    IF FOUND THEN
      RAISE EXCEPTION 'Folder with name "%" already exists with root container', NEW.name;
    END IF;
  END IF;
  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."check_folder_constraints"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_folder_cycle"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    current_container UUID;
BEGIN
    -- Si el contenedor no ha cambiado, no hay necesidad de verificar
    IF TG_OP = 'UPDATE' AND OLD.container IS NOT DISTINCT FROM NEW.container THEN
        RETURN NEW;
    END IF;

    -- Si el nuevo contenedor es NULL (raíz), no hay ciclo
    IF NEW.container IS NULL THEN
        RETURN NEW;
    END IF;

    -- Verificar si el nuevo contenedor crea un ciclo
    current_container := NEW.container;

    WHILE current_container IS NOT NULL LOOP
        -- Si encontramos el ID de la carpeta actual en la jerarquía, hay un ciclo
        IF current_container = NEW.id THEN
            RAISE EXCEPTION 'Ciclo detectado: la carpeta no puede estar contenida dentro de sí misma o dentro de una carpeta que la contiene.';
        END IF;

        -- Obtener el contenedor del contenedor actual
        SELECT container INTO current_container
        FROM folders
        WHERE id = current_container;
    END LOOP;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_folder_cycle"() OWNER TO "postgres";


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


ALTER FUNCTION "public"."clone_organization"("original_org_id" "uuid", "new_org_name" character varying, "new_org_slug" character varying) OWNER TO "postgres";


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


ALTER FUNCTION "public"."crear_carpeta"("p_foldername" character varying, "p_container_id" "uuid", "p_slug" "text") OWNER TO "postgres";


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


ALTER FUNCTION "public"."create_file"("p_name" character varying, "p_container" "uuid") OWNER TO "postgres";


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


ALTER FUNCTION "public"."create_file_quill"("p_name" character varying, "p_container" "uuid") OWNER TO "postgres";


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


ALTER FUNCTION "public"."create_file_quill"("p_name" character varying, "p_container" "uuid", "p_slug" "text") OWNER TO "postgres";


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


ALTER FUNCTION "public"."create_file_quill"("p_name" character varying, "p_container" "uuid", "p_organization_id" "uuid") OWNER TO "postgres";


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


ALTER FUNCTION "public"."duplicate_filesquill_record"("p_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enviar_email"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  org_name varchar;
  org_description text;
begin
  -- Obtener datos de la organización
  select o.name, o.description into org_name, org_description
  from public.organizations o
  where o.id = NEW.organization_id;

  -- Enviar email con datos combinados
  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || 're_8vYJDdWb_2cR8MKuB3MvdbAjwvXgUWUjE'
    )::jsonb,
    body := json_build_object(
      'from', 'notreply@andinotechnologies.com',
      'to', NEW.email,
      'subject', 'Invitación a Organización',
      'html', format('
        <div style="background:#f0f0f0; padding:20px;">
          <h1>%s</h1>
          <h5>%s</h5>

          <p>This email has been sent to invite you to join this organization.</p>
          <p>If you did not request to join the organization, you can ignore this email.</p>
        
          <a href="https://smartflo.vercel.app/join/%s" 
             style="background:#007bff; color:white; padding:10px 20px; text-decoration:none;">
            go to organization join page
          </a>
        </div>
      ', 
      org_name, 
      org_description, 
      NEW.id)
    )::jsonb
  );

  return new;
exception
  when others then
    raise warning 'Error enviando email: %', sqlerrm;
    return new;
end;
$$;


ALTER FUNCTION "public"."enviar_email"() OWNER TO "postgres";


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


ALTER FUNCTION "public"."generate_random_string"("length" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_folder_path_contents"("p_folder_id" "uuid") RETURNS TABLE("id" "uuid", "name" character varying, "type" integer, "published" boolean)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    path_ids UUID[];
BEGIN
    -- CTE con alias explícitos para evitar ambigüedades
    WITH RECURSIVE folder_path AS (
        SELECT 
            f.id AS folder_id,  -- Alias único
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
    FROM unnest(path_ids) AS current_folder_id  -- Alias único
    CROSS JOIN LATERAL getfolderContent(current_folder_id) AS gc;
END;
$$;


ALTER FUNCTION "public"."get_folder_path_contents"("p_folder_id" "uuid") OWNER TO "postgres";


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


ALTER FUNCTION "public"."get_user_organizations"("p_user_id" "uuid", "p_name" "text", "p_page" integer, "p_page_size" integer) OWNER TO "postgres";


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


ALTER FUNCTION "public"."getfilescount"("p_folder_id" "uuid") OWNER TO "postgres";


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


ALTER FUNCTION "public"."getfoldercontentquill"("p_folder_id" "uuid", "p_slug" "text") OWNER TO "postgres";


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
    
    -- Iniciar la búsqueda con la carpeta ingresada
    curr_folder_id := p_folder_id;
    
    LOOP
        SELECT f.container 
          INTO parent_folder_id
        FROM public.folders f
        WHERE f.id = curr_folder_id;
        
        -- Si no hay contenedor, entonces se llegó al global root
        IF parent_folder_id IS NULL THEN
            EXIT;
        END IF;
        
        ancestors := ancestors || parent_folder_id;
        curr_folder_id := parent_folder_id;
    END LOOP;
    
    -- Invertir el arreglo para que el primer elemento sea el de más alto nivel
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
        -- Por cada nivel de la jerarquía se obtiene su contenido
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


ALTER FUNCTION "public"."gethierarchyfoldercontent"("p_folder_id" "uuid", "p_slug" "text") OWNER TO "postgres";


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


ALTER FUNCTION "public"."getmembers"("a_organization_id" "uuid") OWNER TO "postgres";


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


ALTER FUNCTION "public"."getrootcontent"() OWNER TO "postgres";


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


ALTER FUNCTION "public"."getrootcontentquill"() OWNER TO "postgres";


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


ALTER FUNCTION "public"."getrootcontentquillfiltered"("p_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Insertar un nuevo registro en la tabla organizations_users.
  -- NEW es una variable especial que contiene el nuevo registro insertado en auth.users.
  INSERT INTO public.organizations_users (user_id, organization_id, roll_id)
  VALUES (
    NEW.id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    '18244be7-6f88-48ff-8bf3-911f1d712618'
  );

  RETURN NEW; -- La función debe retornar NEW para triggers AFTER INSERT.
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


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


ALTER FUNCTION "public"."is_user_in_organization"("p_email" "text", "p_organization_id" "uuid") OWNER TO "postgres";


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


ALTER FUNCTION "public"."move_file"("p_file_id" "uuid", "p_new_container_id" "uuid") OWNER TO "postgres";


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


ALTER FUNCTION "public"."move_file_quill"("p_file_id" "uuid", "p_new_container_id" "uuid") OWNER TO "postgres";


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


ALTER FUNCTION "public"."move_file_to_root"("p_file_id" "uuid") OWNER TO "postgres";


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


ALTER FUNCTION "public"."move_file_to_root_quill"("p_file_id" "uuid") OWNER TO "postgres";


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


ALTER FUNCTION "public"."move_folder_to_root"("p_folder_id" "uuid") OWNER TO "postgres";


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


ALTER FUNCTION "public"."mover_carpeta"("p_folder_id" "uuid", "p_new_container_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."partial_search_filesquill"("search_term" "text", "p_slug" "uuid") RETURNS TABLE("id" "uuid", "name" character varying, "content" "text", "searchtext" "text", "container" "uuid", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "similarity_score" real, "type" integer)
    LANGUAGE "plpgsql" STABLE
    AS $$
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
$$;


ALTER FUNCTION "public"."partial_search_filesquill"("search_term" "text", "p_slug" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."spreadtutorial"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Inserta nuevos registros en la tabla 'organizations_users'.
    -- La inserción se realiza para cada usuario que aún no pertenece a la organización especificada.
    INSERT INTO public.organizations_users (user_id, organization_id, roll_id)
    SELECT
        u.id,                                     -- El ID del usuario a agregar
        'f47ac10b-58cc-4372-a567-0e02b2c3d479', -- El ID de la organización de destino
        '18244be7-6f88-48ff-8bf3-911f1d712618'  -- El ID del rol que se asignará
    FROM
        auth.users u
    WHERE
        -- La cláusula 'NOT EXISTS' se asegura de que solo seleccionemos usuarios
        -- que no tengan ya un registro en 'organizations_users' para esta organización.
        NOT EXISTS (
            SELECT 1
            FROM public.organizations_users ou
            WHERE ou.user_id = u.id
            AND ou.organization_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
        );
END;
$$;


ALTER FUNCTION "public"."spreadtutorial"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "navigator"."folders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "container" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "navigator"."folders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_version_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "created_by" "text"
);


ALTER TABLE "public"."document_version_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."document_version_history" IS 'Esta tabla guarda la version de los documentos';



CREATE TABLE IF NOT EXISTS "public"."errors_log" (
    "id" bigint NOT NULL,
    "message" "text" NOT NULL,
    "stack" "text",
    "timestamp" "date"
);


ALTER TABLE "public"."errors_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."errors_log" IS 'Esta tabla almacena un log de los errores capturados por la app';



ALTER TABLE "public"."errors_log" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."errors_log_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "container" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "content" "jsonb",
    "published" boolean DEFAULT false
);


ALTER TABLE "public"."files" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."filesquill" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "container" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "content" "text",
    "published" boolean DEFAULT false,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "searchable_text" "text" GENERATED ALWAYS AS ((((COALESCE("name", ''::character varying))::"text" || ' '::"text") || COALESCE("regexp_replace"("content", '<[^>]+>'::"text", ''::"text", 'gi'::"text"), ''::"text"))) STORED,
    "organization_id" "uuid"
);


ALTER TABLE "public"."filesquill" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."folders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "container" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "organization_id" "uuid",
    CONSTRAINT "check_self_container" CHECK ((("container" IS NULL) OR ("container" <> "id")))
);


ALTER TABLE "public"."folders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" DEFAULT "gen_random_uuid"(),
    "email" character varying NOT NULL,
    "invited_by" "uuid" DEFAULT "gen_random_uuid"(),
    "status" character varying DEFAULT ''::character varying NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "level_id" "uuid"
);


ALTER TABLE "public"."organization_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying NOT NULL,
    "description" "text" NOT NULL,
    "slug" character varying NOT NULL,
    "open" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid"
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "roll_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."organizations_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rolls" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "level" character varying NOT NULL,
    "read" boolean NOT NULL,
    "write" boolean NOT NULL,
    "delete" boolean NOT NULL,
    "invite" boolean DEFAULT false NOT NULL,
    "configure" boolean
);


ALTER TABLE "public"."rolls" OWNER TO "postgres";


ALTER TABLE ONLY "navigator"."folders"
    ADD CONSTRAINT "folders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_version_history"
    ADD CONSTRAINT "document_version_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."errors_log"
    ADD CONSTRAINT "errors_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."files"
    ADD CONSTRAINT "files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."filesquill"
    ADD CONSTRAINT "filesquill_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."folders"
    ADD CONSTRAINT "folders_name_container_organization_unique" UNIQUE ("name", "container", "organization_id");



ALTER TABLE ONLY "public"."folders"
    ADD CONSTRAINT "folders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_name_user_id_key" UNIQUE ("name", "user_id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."organizations_users"
    ADD CONSTRAINT "organizations_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rolls"
    ADD CONSTRAINT "rolls_level_key" UNIQUE ("level");



ALTER TABLE ONLY "public"."rolls"
    ADD CONSTRAINT "rolls_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations_users"
    ADD CONSTRAINT "unique_user_organization" UNIQUE ("user_id", "organization_id");



CREATE INDEX "idx_filesquill_trgm_search" ON "public"."filesquill" USING "gin" ("searchable_text" "public"."gin_trgm_ops");



CREATE OR REPLACE TRIGGER "before_insert_or_update_folder" BEFORE INSERT OR UPDATE ON "public"."folders" FOR EACH ROW EXECUTE FUNCTION "public"."check_folder_constraints"();



CREATE OR REPLACE TRIGGER "before_insert_organization_trigger" BEFORE INSERT ON "public"."organizations" FOR EACH ROW WHEN ((("new"."slug" IS NULL) OR (("new"."slug")::"text" = ''::"text"))) EXECUTE FUNCTION "public"."before_insert_organization"();



CREATE OR REPLACE TRIGGER "before_update_updated_at_column" BEFORE UPDATE ON "public"."filesquill" FOR EACH ROW EXECUTE FUNCTION "storage"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "enviar_email_trigger" AFTER INSERT ON "public"."organization_invitations" FOR EACH ROW EXECUTE FUNCTION "public"."enviar_email"();



CREATE OR REPLACE TRIGGER "prevent_folder_cycle" BEFORE INSERT OR UPDATE ON "public"."folders" FOR EACH ROW EXECUTE FUNCTION "public"."check_folder_cycle"();



ALTER TABLE ONLY "navigator"."folders"
    ADD CONSTRAINT "folders_container_fkey" FOREIGN KEY ("container") REFERENCES "navigator"."folders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."document_version_history"
    ADD CONSTRAINT "document_version_history_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."filesquill"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."files"
    ADD CONSTRAINT "files_container_fkey" FOREIGN KEY ("container") REFERENCES "public"."folders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."filesquill"
    ADD CONSTRAINT "filesquill_container_fkey" FOREIGN KEY ("container") REFERENCES "public"."folders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."filesquill"
    ADD CONSTRAINT "filesquill_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."folders"
    ADD CONSTRAINT "folders_container_fkey" FOREIGN KEY ("container") REFERENCES "public"."folders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."folders"
    ADD CONSTRAINT "folders_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."rolls"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizations_users"
    ADD CONSTRAINT "organizations_users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizations_users"
    ADD CONSTRAINT "organizations_users_roll_id_fkey" FOREIGN KEY ("roll_id") REFERENCES "public"."rolls"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."organizations_users"
    ADD CONSTRAINT "organizations_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE "navigator"."folders" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "navigator"."folders";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."organizations_users";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
























































































































SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;

































SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;















GRANT ALL ON FUNCTION "public"."actualizar_carpeta"("p_foldername" character varying, "p_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."actualizar_carpeta"("p_foldername" character varying, "p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."actualizar_carpeta"("p_foldername" character varying, "p_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."actualizar_carpeta_root"("p_foldername" character varying, "p_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."actualizar_carpeta_root"("p_foldername" character varying, "p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."actualizar_carpeta_root"("p_foldername" character varying, "p_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."before_insert_organization"() TO "anon";
GRANT ALL ON FUNCTION "public"."before_insert_organization"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."before_insert_organization"() TO "service_role";



GRANT ALL ON FUNCTION "public"."borrar_archivo"("p_file_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."borrar_archivo"("p_file_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."borrar_archivo"("p_file_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."borrar_archivo_quill"("p_file_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."borrar_archivo_quill"("p_file_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."borrar_archivo_quill"("p_file_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."borrar_carpeta"("p_folder_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."borrar_carpeta"("p_folder_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."borrar_carpeta"("p_folder_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_folder_constraints"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_folder_constraints"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_folder_constraints"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_folder_cycle"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_folder_cycle"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_folder_cycle"() TO "service_role";



GRANT ALL ON FUNCTION "public"."clone_organization"("original_org_id" "uuid", "new_org_name" character varying, "new_org_slug" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."clone_organization"("original_org_id" "uuid", "new_org_name" character varying, "new_org_slug" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."clone_organization"("original_org_id" "uuid", "new_org_name" character varying, "new_org_slug" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."crear_carpeta"("p_foldername" character varying, "p_container_id" "uuid", "p_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."crear_carpeta"("p_foldername" character varying, "p_container_id" "uuid", "p_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."crear_carpeta"("p_foldername" character varying, "p_container_id" "uuid", "p_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_file"("p_name" character varying, "p_container" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_file"("p_name" character varying, "p_container" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_file"("p_name" character varying, "p_container" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_file_quill"("p_name" character varying, "p_container" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_file_quill"("p_name" character varying, "p_container" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_file_quill"("p_name" character varying, "p_container" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_file_quill"("p_name" character varying, "p_container" "uuid", "p_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_file_quill"("p_name" character varying, "p_container" "uuid", "p_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_file_quill"("p_name" character varying, "p_container" "uuid", "p_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_file_quill"("p_name" character varying, "p_container" "uuid", "p_organization_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_file_quill"("p_name" character varying, "p_container" "uuid", "p_organization_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_file_quill"("p_name" character varying, "p_container" "uuid", "p_organization_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."duplicate_filesquill_record"("p_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."duplicate_filesquill_record"("p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."duplicate_filesquill_record"("p_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."enviar_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."enviar_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enviar_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_random_string"("length" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."generate_random_string"("length" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_random_string"("length" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_folder_path_contents"("p_folder_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_folder_path_contents"("p_folder_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_folder_path_contents"("p_folder_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_organizations"("p_user_id" "uuid", "p_name" "text", "p_page" integer, "p_page_size" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_organizations"("p_user_id" "uuid", "p_name" "text", "p_page" integer, "p_page_size" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_organizations"("p_user_id" "uuid", "p_name" "text", "p_page" integer, "p_page_size" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."getfilescount"("p_folder_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."getfilescount"("p_folder_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."getfilescount"("p_folder_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."getfoldercontentquill"("p_folder_id" "uuid", "p_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."getfoldercontentquill"("p_folder_id" "uuid", "p_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."getfoldercontentquill"("p_folder_id" "uuid", "p_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."gethierarchyfoldercontent"("p_folder_id" "uuid", "p_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."gethierarchyfoldercontent"("p_folder_id" "uuid", "p_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gethierarchyfoldercontent"("p_folder_id" "uuid", "p_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."getmembers"("a_organization_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."getmembers"("a_organization_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."getmembers"("a_organization_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."getrootcontent"() TO "anon";
GRANT ALL ON FUNCTION "public"."getrootcontent"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."getrootcontent"() TO "service_role";



GRANT ALL ON FUNCTION "public"."getrootcontentquill"() TO "anon";
GRANT ALL ON FUNCTION "public"."getrootcontentquill"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."getrootcontentquill"() TO "service_role";



GRANT ALL ON FUNCTION "public"."getrootcontentquillfiltered"("p_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."getrootcontentquillfiltered"("p_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."getrootcontentquillfiltered"("p_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_in_organization"("p_email" "text", "p_organization_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_in_organization"("p_email" "text", "p_organization_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_in_organization"("p_email" "text", "p_organization_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."move_file"("p_file_id" "uuid", "p_new_container_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."move_file"("p_file_id" "uuid", "p_new_container_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."move_file"("p_file_id" "uuid", "p_new_container_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."move_file_quill"("p_file_id" "uuid", "p_new_container_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."move_file_quill"("p_file_id" "uuid", "p_new_container_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."move_file_quill"("p_file_id" "uuid", "p_new_container_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."move_file_to_root"("p_file_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."move_file_to_root"("p_file_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."move_file_to_root"("p_file_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."move_file_to_root_quill"("p_file_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."move_file_to_root_quill"("p_file_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."move_file_to_root_quill"("p_file_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."move_folder_to_root"("p_folder_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."move_folder_to_root"("p_folder_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."move_folder_to_root"("p_folder_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."mover_carpeta"("p_folder_id" "uuid", "p_new_container_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mover_carpeta"("p_folder_id" "uuid", "p_new_container_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mover_carpeta"("p_folder_id" "uuid", "p_new_container_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."partial_search_filesquill"("search_term" "text", "p_slug" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."partial_search_filesquill"("search_term" "text", "p_slug" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."partial_search_filesquill"("search_term" "text", "p_slug" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."spreadtutorial"() TO "anon";
GRANT ALL ON FUNCTION "public"."spreadtutorial"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."spreadtutorial"() TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";



























GRANT ALL ON TABLE "public"."document_version_history" TO "anon";
GRANT ALL ON TABLE "public"."document_version_history" TO "authenticated";
GRANT ALL ON TABLE "public"."document_version_history" TO "service_role";



GRANT ALL ON TABLE "public"."errors_log" TO "anon";
GRANT ALL ON TABLE "public"."errors_log" TO "authenticated";
GRANT ALL ON TABLE "public"."errors_log" TO "service_role";



GRANT ALL ON SEQUENCE "public"."errors_log_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."errors_log_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."errors_log_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."files" TO "anon";
GRANT ALL ON TABLE "public"."files" TO "authenticated";
GRANT ALL ON TABLE "public"."files" TO "service_role";



GRANT ALL ON TABLE "public"."filesquill" TO "anon";
GRANT ALL ON TABLE "public"."filesquill" TO "authenticated";
GRANT ALL ON TABLE "public"."filesquill" TO "service_role";



GRANT ALL ON TABLE "public"."folders" TO "anon";
GRANT ALL ON TABLE "public"."folders" TO "authenticated";
GRANT ALL ON TABLE "public"."folders" TO "service_role";



GRANT ALL ON TABLE "public"."organization_invitations" TO "anon";
GRANT ALL ON TABLE "public"."organization_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."organizations_users" TO "anon";
GRANT ALL ON TABLE "public"."organizations_users" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations_users" TO "service_role";



GRANT ALL ON TABLE "public"."rolls" TO "anon";
GRANT ALL ON TABLE "public"."rolls" TO "authenticated";
GRANT ALL ON TABLE "public"."rolls" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
