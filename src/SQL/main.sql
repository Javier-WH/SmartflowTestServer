-- search query example
SELECT *
FROM public.files
WHERE EXISTS (
  SELECT 1
  FROM jsonb_array_elements(
    CASE 
      WHEN jsonb_typeof(content) = 'array' THEN content 
      ELSE '[]'::jsonb 
    END
  ) AS elem
  WHERE elem->>'text' like '%dos%'
);
-- search query example
SELECT *
FROM public.files
WHERE 
  name like '%json%' OR
  jsonb_typeof(content) = 'array'
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(content) AS elem
    WHERE elem->>'text' like '%json%'
  );

-- create folder table
DROP TABLE IF EXISTS public.folders;
create table public.folders (
  id uuid not null default gen_random_uuid (),
  name character varying(100) not null,
  container uuid null,
  created_at timestamp with time zone null default now(),
  constraint folders_pkey primary key (id),
  constraint folders_name_container_unique unique (name, container),
  constraint folders_container_fkey foreign KEY (container) references folders (id) on delete CASCADE,
  constraint check_self_container check (
    (
      (container is null)
      or (container <> id)
    )
  )
) TABLESPACE pg_default;

-- create file table
DROP TABLE IF EXISTS public.files;
create table public.files (
  id uuid not null default gen_random_uuid (),
  name character varying(100) not null,
  container uuid null,
  created_at timestamp with time zone null default now(),
  content jsonb null,
  published boolean null default false,
  constraint files_pkey primary key (id),
  constraint files_container_fkey foreign KEY (container) references folders (id) on delete CASCADE
) TABLESPACE pg_default;


-- create function to check folder cycle
DROP TRIGGER IF EXISTS before_insert_or_update_folder ON public.folders;
DROP FUNCTION IF EXISTS check_folder_constraints();

CREATE OR REPLACE FUNCTION check_folder_cycle()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_folder_cycle
BEFORE INSERT OR UPDATE ON folders
FOR EACH ROW
EXECUTE FUNCTION check_folder_cycle();


DROP TRIGGER prevent_folder_cycle ON folders;

DROP FUNCTION IF EXISTS check_folder_cycle();



CREATE OR REPLACE FUNCTION check_folder_constraints()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.container IS NULL THEN
    PERFORM 1
    FROM public.folders
    WHERE name = NEW.name
    AND container IS NULL;
  
    IF FOUND THEN
      RAISE EXCEPTION 'Folder with name "%" already exists with root container', NEW.name;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER before_insert_or_update_folder
BEFORE INSERT OR UPDATE ON public.folders
FOR EACH ROW
EXECUTE FUNCTION check_folder_constraints();


-- create function move folder

DROP FUNCTION IF EXISTS mover_carpeta;

CREATE OR REPLACE FUNCTION mover_carpeta(p_folder_id UUID, p_new_container_id UUID)
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

    -- 2. Mover la carpeta actualizando el campo 'container'
    UPDATE public.folders
    SET container = p_new_container_id
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
        public.files a
    WHERE
        (v_old_container_id IS NOT NULL AND a.container = v_old_container_id)
        OR (p_new_container_id IS NOT NULL AND a.container = p_new_container_id);
END;
$$ LANGUAGE plpgsql;


-- create function get folder content
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
        (p_folder_id IS NULL AND f.container IS NULL)  -- Manejo de NULL
        OR f.container = p_folder_id                   -- Caso normal
    
    UNION ALL
    
    SELECT
        a.id AS id,
        a.name AS name,
        0 AS type,
        a.published AS published  
    FROM public.files a
    WHERE
        (p_folder_id IS NULL AND a.container IS NULL)  -- Manejo de NULL
        OR a.container = p_folder_id;                  -- Caso normal
END;
$$ LANGUAGE plpgsql;

-- DROP FUNCTION getfolderContent;


SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public';


-- create funcion move file

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
$$ LANGUAGE plpgsql;


--create function get root content
DROP FUNCTION IF EXISTS getRootContent;
CREATE OR REPLACE FUNCTION getRootContent()
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
$$ LANGUAGE plpgsql;

--create fuction move files to root

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

--create function create file

CREATE OR REPLACE FUNCTION create_file(
  p_name varchar(100),
  p_container uuid DEFAULT NULL
) 
RETURNS uuid AS $$
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
$$ LANGUAGE plpgsql;


-- create function create folder

DROP FUNCTION IF EXISTS crear_carpeta;

CREATE OR REPLACE FUNCTION crear_carpeta(p_folderName VARCHAR, p_container_id UUID)
RETURNS TABLE (
    itemId UUID,
    name VARCHAR,
    container_id UUID,
    type integer,
    published boolean
) AS $$
BEGIN
    -- 1. Insertar la carpeta
    INSERT INTO public.folders (name, container) 
    VALUES (p_folderName, p_container_id);

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
        public.files a
    WHERE
        a.container IS NOT DISTINCT FROM p_container_id;
END;
$$ LANGUAGE plpgsql;


