-- Organizations domain schema
-- Contains tables for managing organizations, members, roles, and invitations

-- Organizations table
create table public.organizations (
    id uuid primary key default gen_random_uuid(),
    name varchar not null,
    description text not null,
    slug varchar not null unique,
    open boolean default true not null,
    created_at timestamp with time zone default now() not null,
    user_id uuid references auth.users(id) on update cascade on delete cascade,
    unique(name, user_id)
);

-- Organization roles/permissions table
create table public.rolls (
    id uuid primary key default gen_random_uuid(),
    level varchar not null unique,
    read boolean not null,
    write boolean not null,
    delete boolean not null,
    invite boolean default false not null,
    configure boolean
);

-- Organization members table
create table public.organizations_users (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    roll_id uuid not null references public.rolls(id) on update cascade,
    created_at timestamp with time zone default now() not null,
    unique(user_id, organization_id)
);

-- Organization invitations table
create table public.organization_invitations (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid default gen_random_uuid() references public.organizations(id) on delete cascade,
    email varchar not null,
    invited_by uuid default gen_random_uuid() references auth.users(id),
    status varchar default '' not null,
    created_at timestamp without time zone default now(),
    level_id uuid references public.rolls(id) on delete set null
);

-- Enable Row Level Security
alter table public.organizations enable row level security;
alter table public.organizations_users enable row level security;
alter table public.organization_invitations enable row level security;
alter table public.rolls enable row level security;


-- Stored procedures

CREATE OR REPLACE FUNCTION "public"."clone_organization"("original_org_id" "uuid", "new_org_name" character varying, "new_org_slug" character varying) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    new_org_id UUID;
    folder_record RECORD;
    file_record RECORD;
    user_record RECORD;
    temp_new_folder_id UUID;  -- Cambi el nombre para evitar ambigedad
    mapped_folder_id UUID;    -- Variable para el mapeo
    rows_processed INTEGER;
BEGIN
    -- Crear tabla temporal para mapeo de carpetas
    CREATE TEMP TABLE IF NOT EXISTS folder_mapping (

        old_folder_id UUID PRIMARY KEY,
        new_folder_id UUID NOT NULL
    ) ON COMMIT DROP;

    -- 1. Crear nueva organizacin
    INSERT INTO organizations (name, description, slug, open, user_id)
    SELECT new_org_name, description, new_org_slug, open, user_id
    FROM organizations 
    WHERE id = original_org_id
    RETURNING id INTO new_org_id;

    -- 2. Clonar usuarios de la organizacin
    INSERT INTO organizations_users (user_id, organization_id, roll_id)
    SELECT user_id, new_org_id, roll_id
    FROM organizations_users 
    WHERE organization_id = original_org_id;

    -- 3. Clonar carpetas usando enfoque recursivo
    -- Primero las carpetas raz (container IS NULL)
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
            -- Obtener el nuevo ID del contenedor (usando alias para evitar ambigedad)
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
        
        -- Salir del bucle cuando no se procesen ms filas
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

    -- La tabla temporal se eliminar automticamente al final de la transaccin por ON COMMIT DROP
    RETURN new_org_id;
END;
$$;
