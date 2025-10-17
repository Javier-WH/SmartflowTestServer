alter table "navigator"."folders" drop constraint "folders_container_fkey";

alter table "navigator"."folders" alter column "id" set default uuid_generate_v4();

alter table "navigator"."folders" disable row level security;

alter table "navigator"."folders" add constraint "folders_container_fkey" FOREIGN KEY (container) REFERENCES navigator.folders(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "navigator"."folders" validate constraint "folders_container_fkey";


revoke delete on table "public"."files" from "anon";

revoke insert on table "public"."files" from "anon";

revoke references on table "public"."files" from "anon";

revoke select on table "public"."files" from "anon";

revoke trigger on table "public"."files" from "anon";

revoke truncate on table "public"."files" from "anon";

revoke update on table "public"."files" from "anon";

revoke delete on table "public"."files" from "authenticated";

revoke insert on table "public"."files" from "authenticated";

revoke references on table "public"."files" from "authenticated";

revoke select on table "public"."files" from "authenticated";

revoke trigger on table "public"."files" from "authenticated";

revoke truncate on table "public"."files" from "authenticated";

revoke update on table "public"."files" from "authenticated";

revoke delete on table "public"."files" from "service_role";

revoke insert on table "public"."files" from "service_role";

revoke references on table "public"."files" from "service_role";

revoke select on table "public"."files" from "service_role";

revoke trigger on table "public"."files" from "service_role";

revoke truncate on table "public"."files" from "service_role";

revoke update on table "public"."files" from "service_role";

alter table "public"."files" drop constraint "files_container_fkey";

alter table "public"."folders" drop constraint "check_self_container";

alter table "public"."folders" drop constraint "folders_name_container_organization_unique";

alter table "public"."organizations_users" drop constraint "unique_user_organization";

alter table "public"."filesquill" drop constraint "filesquill_container_fkey";

alter table "public"."filesquill" drop constraint "filesquill_organization_id_fkey";

alter table "public"."folders" drop constraint "folders_container_fkey";

alter table "public"."folders" drop constraint "folders_organization_id_fkey";

alter table "public"."organizations" drop constraint "organizations_user_id_fkey";

alter table "public"."organizations_users" drop constraint "organizations_users_user_id_fkey";

drop function if exists "public"."borrar_archivo"(p_file_id uuid);

drop function if exists "public"."create_file"(p_name character varying, p_container uuid);

drop function if exists "public"."create_file_quill"(p_name character varying, p_container uuid);

drop function if exists "public"."create_file_quill"(p_name character varying, p_container uuid, p_organization_id uuid);

drop function if exists "public"."getrootcontent"();

drop function if exists "public"."move_file"(p_file_id uuid, p_new_container_id uuid);

drop function if exists "public"."move_file_to_root"(p_file_id uuid);

drop function if exists "public"."spreadtutorial"();

drop function if exists "public"."create_file_quill"(p_name character varying, p_container uuid, p_slug text);

alter table "public"."files" drop constraint "files_pkey";

drop index if exists "public"."files_pkey";

drop index if exists "public"."folders_name_container_organization_unique";

drop index if exists "public"."unique_user_organization";

drop table "public"."files";

create table "public"."business" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "name" character varying(50) not null,
    "description" text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."business" enable row level security;

create table "public"."business_member" (
    "id" uuid not null default uuid_generate_v4(),
    "business_id" uuid not null,
    "user_id" uuid not null,
    "role_id" uuid,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."business_member" enable row level security;

alter table "public"."document_version_history" alter column "id" set default uuid_generate_v4();

alter table "public"."document_version_history" alter column "name" set data type character varying(100) using "name"::character varying(100);

alter table "public"."errors_log" alter column "id" set data type integer using "id"::integer;

alter table "public"."filesquill" alter column "id" set default uuid_generate_v4();

alter table "public"."filesquill" alter column "searchable_text" drop expression;

alter table "public"."folders" alter column "id" set default uuid_generate_v4();

alter table "public"."folders" alter column "organization_id" set not null;

alter table "public"."organization_invitations" alter column "email" set data type character varying(100) using "email"::character varying(100);

alter table "public"."organization_invitations" alter column "id" set default uuid_generate_v4();

alter table "public"."organization_invitations" alter column "invited_by" drop default;

alter table "public"."organization_invitations" alter column "invited_by" set not null;

alter table "public"."organization_invitations" alter column "level_id" set not null;

alter table "public"."organization_invitations" alter column "organization_id" drop default;

alter table "public"."organization_invitations" alter column "organization_id" set not null;

alter table "public"."organization_invitations" alter column "status" drop default;

alter table "public"."organization_invitations" alter column "status" set data type character varying(50) using "status"::character varying(50);

alter table "public"."organizations" alter column "id" set default uuid_generate_v4();

alter table "public"."organizations" alter column "name" set data type character varying(100) using "name"::character varying(100);

DROP TRIGGER before_insert_organization_trigger ON public.organizations;

alter table "public"."organizations" alter column "slug" set data type character varying(50) using "slug"::character varying(50);

CREATE TRIGGER before_insert_organization_trigger BEFORE INSERT ON public.organizations FOR EACH ROW WHEN (((new.slug IS NULL) OR (new.slug = ''))) EXECUTE FUNCTION public.before_insert_organization();

alter table "public"."organizations" alter column "user_id" set not null;

alter table "public"."organizations_users" alter column "id" set default uuid_generate_v4();

alter table "public"."rolls" alter column "id" set default uuid_generate_v4();

alter table "public"."rolls" alter column "level" set data type character varying(100) using "level"::character varying(100);

CREATE UNIQUE INDEX business_member_business_id_user_id_key ON public.business_member USING btree (business_id, user_id);

CREATE UNIQUE INDEX business_member_pkey ON public.business_member USING btree (id);

CREATE UNIQUE INDEX business_pkey ON public.business USING btree (id);

CREATE UNIQUE INDEX folders_name_container_organization_id_key ON public.folders USING btree (name, container, organization_id);

CREATE UNIQUE INDEX organizations_users_user_id_organization_id_key ON public.organizations_users USING btree (user_id, organization_id);

alter table "public"."business" add constraint "business_pkey" PRIMARY KEY using index "business_pkey";

alter table "public"."business_member" add constraint "business_member_pkey" PRIMARY KEY using index "business_member_pkey";

alter table "public"."business" add constraint "business_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."business" validate constraint "business_user_id_fkey";

alter table "public"."business_member" add constraint "business_member_business_id_fkey" FOREIGN KEY (business_id) REFERENCES business(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."business_member" validate constraint "business_member_business_id_fkey";

alter table "public"."business_member" add constraint "business_member_business_id_user_id_key" UNIQUE using index "business_member_business_id_user_id_key";

alter table "public"."business_member" add constraint "business_member_role_id_fkey" FOREIGN KEY (role_id) REFERENCES rolls(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."business_member" validate constraint "business_member_role_id_fkey";

alter table "public"."business_member" add constraint "business_member_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."business_member" validate constraint "business_member_user_id_fkey";

alter table "public"."folders" add constraint "folders_name_container_organization_id_key" UNIQUE using index "folders_name_container_organization_id_key";

alter table "public"."organizations_users" add constraint "organizations_users_user_id_organization_id_key" UNIQUE using index "organizations_users_user_id_organization_id_key";

alter table "public"."filesquill" add constraint "filesquill_container_fkey" FOREIGN KEY (container) REFERENCES folders(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."filesquill" validate constraint "filesquill_container_fkey";

alter table "public"."filesquill" add constraint "filesquill_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."filesquill" validate constraint "filesquill_organization_id_fkey";

alter table "public"."folders" add constraint "folders_container_fkey" FOREIGN KEY (container) REFERENCES folders(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."folders" validate constraint "folders_container_fkey";

alter table "public"."folders" add constraint "folders_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."folders" validate constraint "folders_organization_id_fkey";

alter table "public"."organizations" add constraint "organizations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."organizations" validate constraint "organizations_user_id_fkey";

alter table "public"."organizations_users" add constraint "organizations_users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."organizations_users" validate constraint "organizations_users_user_id_fkey";

set check_function_bodies = off;

create or replace view "public"."business_with_members" as  SELECT b.id,
    b.user_id,
    b.name,
    b.description,
    b.created_at,
    json_agg(json_build_object('id', bm.id, 'user_id', bm.user_id, 'role_id', bm.role_id, 'created_at', bm.created_at)) AS members
   FROM (business b
     LEFT JOIN business_member bm ON ((b.id = bm.business_id)))
  GROUP BY b.id, b.user_id, b.name, b.description, b.created_at;


CREATE OR REPLACE FUNCTION public.generate_searchable_text(name text, content text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
begin
    return lower(coalesce(name, '') || ' ' || coalesce(regexp_replace(regexp_replace(content, '<[^>]+>', ' ', 'gi'), '[^\w\sáéíóúáéíóúññ]', ' ', 'gi'), ''));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.spreadtutorial(p_organization_id uuid, p_role_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
    insert into public.organizations_users (user_id, organization_id, roll_id)
    select
        u.id,
        p_organization_id,
        p_role_id
    from
        auth.users u
    where
        -- la clusula 'not exists' se asegura de que solo seleccionemos usuarios
        -- que no tengan ya un registro en 'organizations_users' para esta organizacin.
        not exists (
            select 1
            from public.organizations_users ou
            where ou.user_id = u.id
            and ou.organization_id = p_organization_id
        );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_searchable_text()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
    new.searchable_text := public.generate_searchable_text(new.name, new.content);
    return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.actualizar_carpeta(p_foldername character varying, p_id uuid)
 RETURNS TABLE(itemid uuid, name character varying, container_id uuid, type integer, published boolean)
 LANGUAGE plpgsql
AS $function$
declare
    p_container_id uuid;  
begin
    -- 1. obtener el container id de la carpeta
    select container into strict p_container_id
    from public.folders
    where id = p_id;

    -- 2. actualizar el nombre de la carpeta (sintaxis corregida)
    update public.folders
    set name = p_foldername  
    where id = p_id;

    -- 3. retornar el contenido del contenedor
    return query
    select
        f.id as itemid,
        f.name as name,
        f.container as container_id,
        1 as type,
        false as published
    from public.folders f
    where f.container is not distinct from p_container_id
    union all
    select
        a.id as itemid,
        a.name as name,
        a.container as container_id,
        0 as type,
        a.published as published
    from public.filesquill a
    where a.container is not distinct from p_container_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.actualizar_carpeta_root(p_foldername character varying, p_id uuid)
 RETURNS TABLE(itemid uuid, name character varying, container_id uuid, type integer, published boolean)
 LANGUAGE plpgsql
AS $function$
begin
    -- 1. actualizar el nombre de la carpeta (sintaxis corregida)
    update public.folders
    set name = p_foldername  
    where id = p_id;

    -- 2. retornar el contenido del contenedor
    return query
    select
        f.id as itemid,
        f.name as name,
        f.container as container_id,
        1 as type,
        false as published
    from public.folders f
    where f.container is null
    union all
    select
        a.id as itemid,
        a.name as name,
        a.container as container_id,
        0 as type,
        a.published as published
    from public.files a
    where a.container is null;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.before_insert_organization()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
  random_slug text;
  slug_exists boolean;
begin
  -- generate a random slug and check if it already exists
  loop
    -- generate a random 20-character string
    random_slug := generate_random_string(20);
    
    -- check if the slug already exists
    select exists(select 1 from organizations where slug = random_slug) into slug_exists;
    
    -- exit the loop if the slug is unique
    exit when not slug_exists;
  end loop;
  
  -- set the slug value
  new.slug := random_slug;
  
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.borrar_archivo_quill(p_file_id uuid)
 RETURNS TABLE(itemid uuid, name character varying, container_id uuid, old_container_id uuid, old_container_empty boolean, type integer, published boolean, "order" bigint)
 LANGUAGE plpgsql
AS $function$
declare
    v_old_container_id uuid;
    v_old_container_empty boolean;
begin
    -- 1. obtener el contenedor actual del archivo
    select container into v_old_container_id
    from public.filesquill
    where id = p_file_id;
    -- 
    -- 2. borrar la carpeta
    delete from public.filesquill where id = p_file_id;
    
    -- 3. comprobar si el contenedor de origen est vaco
    if v_old_container_id is not null then

        select not exists (
            select 1 from public.folders where container = v_old_container_id
            union all
            select 1 from public.filesquill where container = v_old_container_id
        ) into v_old_container_empty;

    else
        v_old_container_empty := null;
    end if;
    
    -- 4. retornar al menos una fila con los metadatos
    return query
    with items as (
        -- carpetas en el contenedor original
        select
            f.id,
            f.name,
            f.container,
            1 as type,
            false as published,
            f.order as order
        from public.folders f
        where f.container is not distinct from v_old_container_id
        union all
        -- archivos en el contenedor original
        select
            a.id,
            a.name,
            a.container,
            0 as type,
            a.published,
            a.order as order
        from public.filesquill a
        where a.container is not distinct from v_old_container_id
    )
    
    select
        i.id::uuid,
        i.name::varchar,
        i.container::uuid,
        v_old_container_id,
        v_old_container_empty,
        i.type::integer,
        i.published::boolean,
        i.order::bigint
    from items i
    union all
    select
        null,  -- itemid
        null,  -- name
        null,  -- container_id
        v_old_container_id,
        v_old_container_empty,
        null,  -- type
        null,   -- published
        0
    where not exists (select 1 from items);  -- solo si no hay registros
end;
$function$
;

CREATE OR REPLACE FUNCTION public.borrar_carpeta(p_folder_id uuid)
 RETURNS TABLE(itemid uuid, name character varying, container_id uuid, old_container_id uuid, old_container_empty boolean, type integer, published boolean, "order" bigint)
 LANGUAGE plpgsql
AS $function$
declare
    v_old_container_id uuid;
    v_old_container_empty boolean;
begin
    -- 1. obtener el contenedor actual de la carpeta
    select container into v_old_container_id
    from public.folders
    where id = p_folder_id;
    
    -- 2. borrar la carpeta
    delete from public.folders where id = p_folder_id;

    -- 3. comprobar si el contenedor de origen est vaco
    if v_old_container_id is not null then
        select not exists (
            select 1 from public.folders where container = v_old_container_id
            union all
            select 1 from public.files where container = v_old_container_id
        ) into v_old_container_empty;

    else
        v_old_container_empty := null;
    end if;
    
    -- 4. retornar al menos una fila con los metadatos
    return query
    with items as (
        -- carpetas en el contenedor original
        select
            f.id,
            f.name,
            f.container,
            1 as type,
            false as published,
            f.order as order
        from public.folders f
        where f.container is not distinct from v_old_container_id
        union all

        -- archivos en el contenedor original

        select
            a.id,
            a.name,
            a.container,
            0 as type,
            a.published,
            a.order as order
        from public.filesquill a
        where a.container is not distinct from v_old_container_id
    )

    select
        i.id::uuid,
        i.name::varchar,
        i.container::uuid,
        v_old_container_id,
        v_old_container_empty,
        i.type::integer,
        i.published::boolean,
        i.order::bigint
    from items i
    union all
    select
        null,  -- itemid
        null,  -- name
        null,  -- container_id
        v_old_container_id,
        v_old_container_empty,
        null,  -- type
        null,   -- published
        0
    where not exists (select 1 from items);  -- solo si no hay registros
end;
$function$
;

CREATE OR REPLACE FUNCTION public.check_folder_constraints()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if new.container is null then
    perform 1
    from public.folders
    where name = new.name
    and organization_id = new.organization_id
    and container is null;
  
    if found then
      raise exception 'folder with name "%" already exists with root container', new.name;
    end if;
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.check_folder_cycle()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    current_container uuid;
begin
    -- si el contenedor no ha cambiado, no hay necesidad de verificar
    if tg_op = 'update' and old.container is not distinct from new.container then
        return new;
    end if;

    -- si el nuevo contenedor es null (raz), no hay ciclo
    if new.container is null then
        return new;
    end if;

    -- verificar si el nuevo contenedor crea un ciclo
    current_container := new.container;

    while current_container is not null loop
        -- si encontramos el id de la carpeta actual en la jerarqua, hay un ciclo
        if current_container = new.id then
            raise exception 'ciclo detectado: la carpeta no puede estar contenida dentro de si misma o dentro de una carpeta que la contiene.';
        end if;

        -- obtener el contenedor del contenedor actual
        select container into current_container
        from folders
        where id = current_container;
    end loop;

    return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.clone_organization(original_org_id uuid, new_org_name character varying, new_org_slug character varying)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
    new_org_id uuid;
    folder_record record;
    file_record record;
    user_record record;
    temp_new_folder_id uuid;  -- cambi el nombre para evitar ambigedad
    mapped_folder_id uuid;    -- variable para el mapeo
    rows_processed integer;
begin
    -- crear tabla temporal para mapeo de carpetas
    create temp table if not exists folder_mapping (
        old_folder_id uuid primary key,
        new_folder_id uuid not null
    ) on commit drop;

    -- 1. crear nueva organizacin
    insert into organizations (name, description, slug, open, user_id)
    select new_org_name, description, new_org_slug, open, user_id
    from organizations 
    where id = original_org_id
    returning id into new_org_id;

    -- 2. clonar usuarios de la organizacin
    insert into organizations_users (user_id, organization_id, roll_id)
    select user_id, new_org_id, roll_id
    from organizations_users 
    where organization_id = original_org_id;

    -- 3. clonar carpetas usando enfoque recursivo
    -- primero las carpetas raz (container is null)
    for folder_record in 
        select * from folders 
        where organization_id = original_org_id 
        and container is null
        order by created_at
    loop
        insert into folders (name, container, organization_id)
        values (folder_record.name, null, new_org_id)
        returning id into temp_new_folder_id;
        
        insert into folder_mapping (old_folder_id, new_folder_id)
        values (folder_record.id, temp_new_folder_id);
    end loop;

    -- luego procesar carpetas anidadas recursivamente
    loop
        rows_processed := 0;
        
        -- insertar carpetas cuyo contenedor ya ha sido mapeado
        for folder_record in 
            select f.* 
            from folders f
            where f.organization_id = original_org_id 
            and f.container is not null
            and f.id not in (select old_folder_id from folder_mapping)
            and f.container in (select old_folder_id from folder_mapping)
        loop
            -- obtener el nuevo id del contenedor (usando alias para evitar ambigedad)
            select fm.new_folder_id into mapped_folder_id 
            from folder_mapping fm
            where fm.old_folder_id = folder_record.container;
            
            insert into folders (name, container, organization_id)
            values (folder_record.name, mapped_folder_id, new_org_id)
            returning id into temp_new_folder_id;
            
            insert into folder_mapping (old_folder_id, new_folder_id)
            values (folder_record.id, temp_new_folder_id);
            
            rows_processed := rows_processed + 1;
        end loop;
        
        -- salir del bucle cuando no se procesen ms filas
        exit when rows_processed = 0;
    end loop;

    -- 4. clonar documentos
    for file_record in 
        select f.* 
        from filesquill f
        where f.organization_id = original_org_id
    loop
        if file_record.container is not null then
            select fm.new_folder_id into mapped_folder_id
            from folder_mapping fm
            where fm.old_folder_id = file_record.container;
        else
            mapped_folder_id := null;
        end if;

        insert into filesquill (name, container, content, published, organization_id)
        values (
            file_record.name, 
            mapped_folder_id, 
            file_record.content, 
            file_record.published, 
            new_org_id
        );
    end loop;

    -- la tabla temporal se eliminar automticamente al final de la transaccin por on commit drop
    return new_org_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.crear_carpeta(p_foldername character varying, p_container_id uuid, p_slug text)
 RETURNS TABLE(itemid uuid, name character varying, container_id uuid, type integer, published boolean)
 LANGUAGE plpgsql
AS $function$
declare
    p_organization_id uuid;
begin
    -- 0. obtener el id de la organizacion

    select o.id into p_organization_id from public.organizations o where o.slug = p_slug;

    -- 1. insertar la carpeta
    insert into public.folders (name, container, organization_id) 
    values (p_foldername, p_container_id, p_organization_id);

    -- 2. retornar el contenido del contenedor
    return query
    select
        f.id as itemid,
        f.name as name,
        f.container as container_id,
        1 as type,  
        false as published
    from
        public.folders f
    where
        f.container is not distinct from p_container_id  
    union all
    select
        a.id as itemid,
        a.name as name,
        a.container as container_id,
        0 as type,
        a.published as published
    from
        public.filesquill a
    where
        a.container is not distinct from p_container_id;  
end;
$function$
;

CREATE OR REPLACE FUNCTION public.create_file_quill(p_name character varying, p_container uuid DEFAULT NULL::uuid, p_slug text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$declare
  new_id uuid;
  p_organization_id uuid;
begin
  -- obtener el organization_id usando el slug

    select o.id into p_organization_id from public.organizations o where o.slug =  p_slug;

  -- insertar el registro manejando el caso especial para container
  insert into public.filesquill(name, container, organization_id, content)
  values (
    p_name,
    case 
      when p_container is null then null
      else p_container
    end,
    p_organization_id,
    '<p><br></p><guided-checklist class="guided-checklist-block" title="" items="[{&quot;id&quot;:&quot;fd2390ff-4643-4dd1-9622-9f5061186ea7&quot;,&quot;index&quot;:0,&quot;text&quot;:&quot;&quot;,&quot;guidande&quot;:&quot;&quot;}]" contenteditable="false" readonly="false"></guided-checklist><p><br></p><p><br></p>'
  )
  returning id into new_id;
  
  return new_id;
end;$function$
;

CREATE OR REPLACE FUNCTION public.duplicate_filesquill_record(p_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
declare
    new_id uuid;
    container_id uuid;
begin
    -- inserta un nuevo registro con los mismos datos del original,
    -- excepto el id, created_at, y updated_at,
    -- y almacena el container en una variable.
    insert into public.filesquill (
        id,
        name,
        container,
        content,
        published,
        organization_id
    )
    select
        gen_random_uuid(),
        name,
        container,
        content,
        published,
        organization_id
    from
        public.filesquill
    where
        id = p_id
    returning
        container into container_id;

    -- retorna el container del registro duplicado.
    return container_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.enviar_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$declare
  org_name varchar;
  org_description text;
begin
  -- obtener datos de la organización
  select o.name, o.description into org_name, org_description
  from public.organizations o
  where o.id = new.organization_id;

  -- enviar email con datos combinados
  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := json_build_object(
      'content-type', 'application/json',
      'authorization', 'bearer ' || 're_f1kjrqe5_hexbq5wppaa8h5usdasn1u5s'
    )::jsonb,
    body := json_build_object(
      'from', 'noreply@smartflo.pro',
      'to', new.email,
      'subject', 'invitación a organización',
      'html', format('
        <div style=background:#f0f0f0; padding:20px;>
          <h1>%s</h1>
          <h5>%s</h5>

          <p>this email has been sent to invite you to join this organization.</p>
          <p>if you did not request to join the organization, you can ignore this email.</p>
        
          <a href=https://smartflo.pro/join/%s 
             style=background:#007bff; color:white; padding:10px 20px; text-decoration:none;>
            go to organization join page
          </a>
        </div>
      ', 
      org_name, 
      org_description, 
      new.id)
    )::jsonb
  );

  return new;
exception
  when others then
    raise warning 'error enviando email: %', sqlerrm;
    return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_random_string(length integer)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
declare
  chars text := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result text := '';
  i integer := 0;
begin
  for i in 1..length loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_folder_path_contents(p_folder_id uuid)
 RETURNS TABLE(id uuid, name character varying, type integer, published boolean)
 LANGUAGE plpgsql
AS $function$
declare
    path_ids uuid[];
begin
    -- cte con alias explcitos para evitar ambigedades
    with recursive folder_path as (
        select 
            f.id as folder_id,  -- alias nico
            f.container
        from public.folders f
        where f.id = p_folder_id  -- cualificado con alias de tabla
        
        union all
        
        select 
            f.id as folder_id,  -- mismo alias en recursivo
            f.container
        from public.folders f
        inner join folder_path fp on f.id = fp.container
    )
    select array_agg(folder_id) into path_ids  -- usamos el alias
    from folder_path
    where folder_id <> p_folder_id;  -- referencia no ambigua

    path_ids := array_reverse(path_ids);

    if array_length(path_ids, 1) > 0 then
        if (select container from public.folders where id = path_ids[1]) is null then
            path_ids := path_ids[2:];
        end if;
    end if;

    return query
    select gc.id, gc.name, gc.type, gc.published
    from unnest(path_ids) as current_folder_id  -- alias nico
    cross join lateral getfoldercontent(current_folder_id) as gc;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_organizations(p_user_id uuid, p_name text DEFAULT NULL::text, p_page integer DEFAULT 1, p_page_size integer DEFAULT 10)
 RETURNS TABLE(id uuid, name character varying, description text, slug character varying, open boolean, created_at timestamp with time zone, user_id uuid, is_creator boolean, is_member boolean, leveltitle character varying, read boolean, write boolean, delete boolean, invite boolean, configure boolean, total_count bigint)
 LANGUAGE plpgsql
AS $function$
declare
  v_start integer;
  v_end integer;
  v_total_count bigint;
begin
  -- calculate pagination
  v_start := (p_page - 1) * p_page_size;
  
  -- get the total count first
  select count(distinct o.id) into v_total_count
  from organizations o
  left join organizations_users ou on o.id = ou.organization_id
  where o.open = true
    and (o.user_id = p_user_id or ou.user_id = p_user_id)
    and (p_name is null or o.name ilike '%' || p_name || '%');
  
  -- return the organizations with pagination
  return query
  with user_orgs as (
    select distinct on (o.id)
      o.id,
      o.name,
      o.description,
      o.slug,
      o.open,
      o.created_at,
      o.user_id,
      (o.user_id = p_user_id) as is_creator,
      (ou.user_id is not null) as is_member,
      roll.level,
      roll.read,
      roll.write,
      roll.delete,
      roll.invite,
      roll.configure
    from organizations o
    left join organizations_users ou on o.id = ou.organization_id and ou.user_id = p_user_id
    left join rolls roll on roll.id = ou.roll_id
    where o.open = true
      and (o.user_id = p_user_id or ou.user_id = p_user_id)
      and (p_name is null or o.name ilike '%' || p_name || '%')
    order by o.id, o.created_at desc
  )
  select 
    uo.*,
    v_total_count as total_count
  from user_orgs uo
  order by uo.created_at desc
  limit p_page_size
  offset v_start;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.getfilescount(p_folder_id uuid)
 RETURNS TABLE(filesnumber character varying)
 LANGUAGE plpgsql
AS $function$
begin
    return query
    with recursive subfolders as (
        select 
            id
        from public.folders
        where id = p_folder_id  -- inicia desde la carpeta especificada
        
        union all
        
        select 
            f.id
        from public.folders f
        inner join subfolders s 
            on f.container = s.id  -- recursividad hacia subcarpetas
    )
    select 
        count(*)::varchar
    from public.filesquill
    where container in (select id from subfolders);  -- archivos en cualquier nivel

end;
$function$
;

CREATE OR REPLACE FUNCTION public.getfoldercontentquill(p_folder_id uuid, p_slug text)
 RETURNS TABLE(id uuid, name character varying, type integer, published boolean, filesnumber character varying, "order" bigint)
 LANGUAGE plpgsql
AS $function$
declare
    p_organization_id uuid;
begin
    -- obtengo el id de la organizacion usando el slug
    select o.id into p_organization_id from public.organizations o where o.slug = p_slug;
    return query
    select
        f.id as id,
        f.name as name,
        1 as type,
        false as published,
         (
            with recursive subfolders as (
                select 
                    folders.id  -- calificar con el nombre de la tabla
                from folders 
                where folders.container = f.id  -- f es el alias de la consulta externa
                union all
                select 
                    fsub.id  -- calificar con alias de tabla
                from folders fsub
                inner join subfolders s on fsub.container = s.id
            )
            select count(*)::varchar
            from public.filesquill
            where 
                container = f.id 
                or container in (
                    select subfolders.id  -- calificar con el nombre del cte
                    from subfolders
                )
        ) as filesnumber,
        f.order as order
    from public.folders f
    where
        (p_folder_id is null and f.container is null and f.organization_id = p_organization_id)  -- manejo de null
        or f.container = p_folder_id                   -- caso normal
    
    union all
    
    select
        a.id as id,
        a.name as name,
        0 as type,
        a.published as published,
        '0' as filesnumber,
        a.order as order
    from public.filesquill a
    where
        (p_folder_id is null and a.container is null and a.organization_id = p_organization_id)  -- manejo de null
        or a.container = p_folder_id;                  -- caso normal
end;
$function$
;

CREATE OR REPLACE FUNCTION public.gethierarchyfoldercontent(p_folder_id uuid, p_slug text)
 RETURNS TABLE(itemid uuid, name character varying, type integer, published boolean, level integer, container_id uuid)
 LANGUAGE plpgsql
AS $function$
declare
    curr_folder_id uuid;         -- folder actual en el recorrido
    parent_folder_id uuid;       -- contenedor del folder actual
    ancestors uuid[] := array[]::uuid[];  -- acumula los id de los padres
    i int;
    rev_array uuid[];            -- arreglo invertido de ancestros
begin
    -- caso en que no se pasa un id: retornamos el contenido del root
    if p_folder_id is null then
        return query
            select r.id, 
                   r.name, 
                   r.type, 
                   r.published, 
                   0 as level,
                   null as container
            from (
                  select * from getrootcontentquill()
            ) r;
        return;
    end if;
    
    -- iniciar la bsqueda con la carpeta ingresada
    curr_folder_id := p_folder_id;
    
    loop
        select f.container 
          into parent_folder_id
        from public.folders f
        where f.id = curr_folder_id;
        
        -- si no hay contenedor, entonces se lleg al global root
        if parent_folder_id is null then
            exit;
        end if;
        
        ancestors := ancestors || parent_folder_id;
        curr_folder_id := parent_folder_id;
    end loop;
    
    -- invertir el arreglo para que el primer elemento sea el de ms alto nivel
    rev_array := (
        select array(
            select t.x
            from unnest(ancestors) with ordinality as t(x, ord)
            order by t.ord desc
        )
    );
    
    -- si no hay ancestros, la carpeta es de primer nivel; se usa el contenido del root
    if rev_array is null or array_length(rev_array, 1) = 0 then
        return query
            select r.id, 
                   r.name, 
                   r.type, 
                   r.published, 
                   0 as level,
                   null as container_id
            from getrootcontentquill() r;
    else
        -- por cada nivel de la jerarqua se obtiene su contenido
        -- se asigna level = (i-1) para que el nivel 0 corresponda al root
        for i in 1..array_length(rev_array, 1) loop
            return query
              select r.id,
                     r.name,
                     r.type,
                     r.published,
                     (i - 1) as level,
                     case
                       when r.type = 1 then (select f.container from public.folders f where f.id = r.id)
                       when r.type = 0 then (select a.container from public.filesquill a where a.id = r.id)
                     end as container_id
              from getfoldercontentquill(rev_array[i], p_slug) r;
        end loop;
    end if;
    
    return;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.getmembers(a_organization_id uuid)
 RETURNS TABLE(userid uuid, useremail character varying, rollid uuid, rollname character varying)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  return query
    select 
      u.id as userid,
      u.email as useremail,
      r.id as rollid,
      r.level as rollname
    from public.organizations_users ou
    join auth.users u on ou.user_id = u.id
    join public.rolls r on ou.roll_id = r.id
    where ou.organization_id = a_organization_id; 
end;
$function$
;

CREATE OR REPLACE FUNCTION public.getrootcontentquill()
 RETURNS TABLE(id uuid, name character varying, type integer, published boolean, filesnumber character varying)
 LANGUAGE plpgsql
AS $function$
begin
    return query
    select
        f.id as id,
        f.name as name,
        1 as type,
        false as published,
                (
            with recursive subfolders as (
                select 
                    folders.id  -- calificar con el nombre de la tabla
                from folders 
                where folders.container = f.id  -- f es el alias de la consulta externa
                union all
                select 
                    fsub.id  -- calificar con alias de tabla
                from folders fsub
                inner join subfolders s on fsub.container = s.id
            )
            select count(*)::varchar
            from public.filesquill
            where 
                container = f.id 
                or container in (
                    select subfolders.id  -- calificar con el nombre del cte
                    from subfolders
                )
        ) as filesnumber
    from public.folders f
    where f.container is null
    
    union all
    
    select
        a.id as id,
        a.name as name,
        0 as type,
        a.published as published,
        '0' as filesnumber 
    from public.filesquill a
    where a.container is null;
    
end;
$function$
;

CREATE OR REPLACE FUNCTION public.getrootcontentquillfiltered(p_slug text)
 RETURNS TABLE(id uuid, name character varying, type integer, published boolean, filesnumber character varying, "order" bigint)
 LANGUAGE plpgsql
AS $function$
declare
    p_organization_id uuid;
begin
    -- se obtiene el id de la organizacion usando el slug
    select o.id into p_organization_id from public.organizations o where o.slug = p_slug;
    -- retornar resultados filtrados

    return query
    select
        f.id,
        f.name,
        1::integer,
        false,
            (
            with recursive subfolders as (
                select 
                    folders.id  -- calificar con el nombre de la tabla
                from folders 
                where folders.container = f.id  -- f es el alias de la consulta externa
                union all
                select 
                    fsub.id  -- calificar con alias de tabla
                from folders fsub
                inner join subfolders s on fsub.container = s.id
            )

            select count(*)::varchar
            from public.filesquill
            where 
                container = f.id 
                or container in (
                    select subfolders.id  -- calificar con el nombre del cte
                    from subfolders
                )
        ) as filesnumber,
         f.order as order
    from public.folders f
    where
        f.organization_id = p_organization_id and
        f.container is null
    union all
    select
        a.id,
        a.name,
        0::integer,
        a.published,
        '0' as filesnumber,
        a.order as order
    from public.filesquill a
    where
        a.organization_id = p_organization_id and
        a.container is null;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  -- insertar un nuevo registro en la tabla organizations_users.
  -- new es una variable especial que contiene el nuevo registro insertado en auth.users.
  insert into public.organizations_users (user_id, organization_id, roll_id)
  values (
    new.id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    '20d09d54-eb0b-498e-a6fa-910f598eec77'
  );

  return new; -- la funcin debe retornar new para triggers after insert.
end;
$function$
;

CREATE OR REPLACE FUNCTION public.is_user_in_organization(p_email text, p_organization_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
    v_is_member boolean;
begin
    -- check if a user with the given email exists and is in the specified organization.
    -- we join with auth.users to get the user id from the email.
    select exists (
        select 1
        from public.organizations_users as ou
        inner join auth.users as au on ou.user_id = au.id
        where au.email = p_email and ou.organization_id = p_organization_id
    ) into v_is_member;

    return v_is_member;

exception
    -- if any other error occurs, return false.
    when others then
        return false;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.move_file_quill(p_file_id uuid, p_new_container_id uuid)
 RETURNS TABLE(itemid uuid, name character varying, container_id uuid, old_container_id uuid, old_container_empty boolean, type integer, published boolean, "order" bigint)
 LANGUAGE plpgsql
AS $function$

declare
  v_old_container_id uuid;
  v_old_container_empty boolean;

begin
    -- 1. obtener el contenedor actual de la carpeta y almacenarlo en una variable
    select f.container into v_old_container_id
    from public.filesquill f
    where f.id = p_file_id;
    -- 2. mover la carpeta actualizando el campo 'container'
    update public.filesquill
    set container = p_new_container_id
    where id = p_file_id;

    -- 3. comprobar en la tabla de archivos si el contenedor de origen est vaco

    if v_old_container_id is not null then

        select not exists (
            select 1 from public.folders where container = v_old_container_id
             union all
            select 1 from public.filesquill where container = v_old_container_id
        ) into v_old_container_empty;
    else
        v_old_container_empty := null;
    end if;

    -- 4. retornar el contenido de los contenedores de origen y destino, y si el contenedor de origen est vaco

    return query

    select
        f.id as itemid,
        f.name as name,
        f.container as container_id,
        v_old_container_id as old_container_id,
        v_old_container_empty as old_container_empty,
        1 as type,
        false as published,
        f.order as order

    from public.folders f

    where
        f.container = v_old_container_id or f.container = p_new_container_id

    union all 

       select
        a.id as itemid,
        a.name as name,
        a.container as container_id,
        v_old_container_id as old_container_id,
        v_old_container_empty as old_container_empty,
        0 as type,
        a.published as published,
        a.order as order
    from public.filesquill a
    where
        a.container = v_old_container_id or a.container = p_new_container_id;

end;
$function$
;

CREATE OR REPLACE FUNCTION public.move_file_to_root_quill(p_file_id uuid)
 RETURNS TABLE(itemid uuid, name character varying, container_id uuid, old_container_id uuid, old_container_empty boolean, type integer, published boolean, filesnumber character varying, "order" bigint)
 LANGUAGE plpgsql
AS $function$

declare
    v_old_container_id uuid;
    v_old_container_empty boolean;
begin
    -- 1. obtener el contenedor actual del archivo y almacenarlo en una variable
    select f.container into v_old_container_id
    from public.filesquill f
    where f.id = p_file_id;

    -- 2. mover el archivo al root

    update public.filesquill
    set container = null
    where id = p_file_id;

    -- 3. comprobar si el contenedor de origen est vaco

    if v_old_container_id is not null then
        select not exists (
            select 1 from public.folders where container = v_old_container_id
            union all
            select 1 from public.filesquill where container = v_old_container_id
        ) into v_old_container_empty;

    else
        v_old_container_empty := null;
    end if;

    -- 4. retornar el contenido de los contenedores de origen y destino, y si el contenedor de origen est vaco
    return query

    with combined as (
        select
            f.id as itemid,
            f.name as name,
            f.container as container_id,
            v_old_container_id as old_container_id,
            v_old_container_empty as old_container_empty,
            1 as type,
            false as published,
            (
            with recursive subfolders as (
                select 
                    folders.id  -- calificar con el nombre de la tabla
                from folders 
                where folders.container = f.id  -- f es el alias de la consulta externa
                union all
                select 
                    fsub.id  -- calificar con alias de tabla
                from folders fsub
                inner join subfolders s on fsub.container = s.id

            )

            select count(*)::varchar
            from public.filesquill
            where 
                container = f.id 
                or container in (
                    select subfolders.id  -- calificar con el nombre del cte
                    from subfolders

                )

        ) as filesnumber,
        f.order as order

        from
            public.folders f
        where
            (v_old_container_id is null and f.container is null) 
            or f.container = v_old_container_id                   

        union all

        select
            a.id as itemid,
            a.name as name,
            a.container as container_id,
            v_old_container_id as old_container_id,
            v_old_container_empty as old_container_empty,
            0 as type,
            a.published as published,
            '0' as filesnumber,
            a.order as order

        from
            public.filesquill a

        where
            (v_old_container_id is null and a.container is null) 
            or a.container = v_old_container_id                   

    )

    select *
    from combined
    union all
    select
        null as itemid,
        'no items found' as name,
        null as container_id,
        v_old_container_id as old_container_id,
        v_old_container_empty as old_container_empty,
        -1 as type,  -- tipo ficticio para indicar que no se encontraron elementos
        false as published,
        '0' as filesnumber,
        0 as order
    where not exists (select 1 from combined);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.move_folder_to_root(p_folder_id uuid)
 RETURNS TABLE(itemid uuid, name character varying, container_id uuid, old_container_id uuid, old_container_empty boolean, type integer, published boolean, "order" bigint)
 LANGUAGE plpgsql
AS $function$

declare
    v_old_container_id uuid;
    v_old_container_empty boolean;
begin

    -- 1. obtener el contenedor actual de la carpeta y almacenarlo en una variable
    select f.container into v_old_container_id
    from public.folders f
    where f.id = p_folder_id;



    -- 2. mover la carpeta al root
    update public.folders
    set container = null
    where id = p_folder_id;



    -- 3. comprobar si el contenedor de origen est vaco
    if v_old_container_id is not null then
        select not exists (
            select 1 from public.folders where container = v_old_container_id
            union all
            select 1 from public.filesquill where container = v_old_container_id
        ) into v_old_container_empty;

    else
        v_old_container_empty := null;
    end if;



    -- 4. retornar el contenido de los contenedores de origen y destino, y si el contenedor de origen est vaco

    return query

    with combined as (
        select
            f.id as itemid,
            f.name as name,
            f.container as container_id,
            v_old_container_id as old_container_id,
            v_old_container_empty as old_container_empty,
            1 as type,
            false as published,
            f.order as order

        from
            public.folders f
        where
            (v_old_container_id is null and f.container is null)  -- manejo de null
            or f.container = v_old_container_id                   -- caso normal

        union all

        select
            a.id as itemid,
            a.name as name,
            a.container as container_id,
            v_old_container_id as old_container_id,
            v_old_container_empty as old_container_empty,
            0 as type,
            a.published as published,
            a.order as order
        from
            public.filesquill a
        where
            (v_old_container_id is null and a.container is null)  -- manejo de null
            or a.container = v_old_container_id                   -- caso normal
    )

    select *
    from combined
    union all
    select
        null as itemid,
        'no items found' as name,
        null as container_id,
        v_old_container_id as old_container_id,
        v_old_container_empty as old_container_empty,
        -1 as type,  -- tipo ficticio para indicar que no se encontraron elementos
        false as published,
        0 as order
        
    where not exists (select 1 from combined);

end;
$function$
;

CREATE OR REPLACE FUNCTION public.mover_carpeta(p_folder_id uuid, p_new_container_id uuid)
 RETURNS TABLE(itemid uuid, name character varying, container_id uuid, old_container_id uuid, old_container_empty boolean, type integer, published boolean, "order" bigint)
 LANGUAGE plpgsql
AS $function$
declare
    v_old_container_id uuid;
    v_old_container_empty boolean;
begin
    -- 1. obtener el contenedor actual de la carpeta y almacenarlo en una variable

    select f.container into v_old_container_id
    from public.folders f
    where f.id = p_folder_id;
    
    -- 2. mover la carpeta actualizando el campo 'container'
    update public.folders
    set container = p_new_container_id
    where id = p_folder_id;

    -- 3. comprobar si el contenedor de origen est vaco
    if v_old_container_id is not null then
        select not exists (
            select 1 from public.folders where container = v_old_container_id
            union all
            select 1 from public.filesquill where container = v_old_container_id
        ) into v_old_container_empty;
    else
        v_old_container_empty := null;
    end if;

    -- 4. retornar el contenido de los contenedores de origen y destino, y si el contenedor de origen est vaco
    return query
    select
        f.id as itemid,
        f.name as name,
        f.container as container_id,
        v_old_container_id as old_container_id,
        v_old_container_empty as old_container_empty,
        1 as type,
        false as published,
        f.order as order
    from
        public.folders f
    where
        (v_old_container_id is not null and f.container = v_old_container_id)
        or (p_new_container_id is not null and f.container = p_new_container_id)
    union all
    select
        a.id as itemid,
        a.name as name,
        a.container as container_id,
        v_old_container_id as old_container_id,
        v_old_container_empty as old_container_empty,
        0 as type,
        a.published as published,
        a.order as order
    from
        public.filesquill a
    where
        (v_old_container_id is not null and a.container = v_old_container_id)
        or (p_new_container_id is not null and a.container = p_new_container_id);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.partial_search_filesquill(search_term text, p_slug uuid)
 RETURNS TABLE(id uuid, name character varying, content text, searchtext text, container uuid, created_at timestamp with time zone, updated_at timestamp with time zone, similarity_score real, type integer)
 LANGUAGE plpgsql
 STABLE
AS $function$
declare
    clean_search_term text;
    words text[];
    subquery_limit constant integer := 50;
begin
    clean_search_term := lower(trim(search_term));
    words := regexp_split_to_array(clean_search_term, '\s+');
    
    return query
    
    (select
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
            case 
                when f.searchable_text ilike '%' || clean_search_term || '%' then 0.3
                else 0
            end +
            -- bonus por coincidencia exacta de palabras
            (select count(*) * 0.1 from unnest(words) word 
             where f.searchable_text ilike '%' || word || '%')
        )::real as similarity_score,
        1 as type
    from public.filesquill f
    where f.organization_id = p_slug
      and (f.searchable_text %> clean_search_term or f.name ilike '%' || clean_search_term || '%')
    order by similarity_score desc
    limit subquery_limit)
    union all

    (select
        x.id,
        x.name,
        null::text as content,
        null::text as searchtext,
        x.container,
        x.created_at,
        null::timestamptz as updated_at,
        (similarity(x.name, clean_search_term) * 1.5)::real as similarity_score,
        0 as type
    from public.folders x
    where x.organization_id = p_slug
      and (x.name %> clean_search_term or x.name ilike '%' || clean_search_term || '%')
    order by similarity_score desc
    limit subquery_limit)

    order by similarity_score desc, type desc
    limit 100;
end;
$function$
;

grant delete on table "public"."business" to "anon";

grant insert on table "public"."business" to "anon";

grant references on table "public"."business" to "anon";

grant select on table "public"."business" to "anon";

grant trigger on table "public"."business" to "anon";

grant truncate on table "public"."business" to "anon";

grant update on table "public"."business" to "anon";

grant delete on table "public"."business" to "authenticated";

grant insert on table "public"."business" to "authenticated";

grant references on table "public"."business" to "authenticated";

grant select on table "public"."business" to "authenticated";

grant trigger on table "public"."business" to "authenticated";

grant truncate on table "public"."business" to "authenticated";

grant update on table "public"."business" to "authenticated";

grant delete on table "public"."business" to "service_role";

grant insert on table "public"."business" to "service_role";

grant references on table "public"."business" to "service_role";

grant select on table "public"."business" to "service_role";

grant trigger on table "public"."business" to "service_role";

grant truncate on table "public"."business" to "service_role";

grant update on table "public"."business" to "service_role";

grant delete on table "public"."business_member" to "anon";

grant insert on table "public"."business_member" to "anon";

grant references on table "public"."business_member" to "anon";

grant select on table "public"."business_member" to "anon";

grant trigger on table "public"."business_member" to "anon";

grant truncate on table "public"."business_member" to "anon";

grant update on table "public"."business_member" to "anon";

grant delete on table "public"."business_member" to "authenticated";

grant insert on table "public"."business_member" to "authenticated";

grant references on table "public"."business_member" to "authenticated";

grant select on table "public"."business_member" to "authenticated";

grant trigger on table "public"."business_member" to "authenticated";

grant truncate on table "public"."business_member" to "authenticated";

grant update on table "public"."business_member" to "authenticated";

grant delete on table "public"."business_member" to "service_role";

grant insert on table "public"."business_member" to "service_role";

grant references on table "public"."business_member" to "service_role";

grant select on table "public"."business_member" to "service_role";

grant trigger on table "public"."business_member" to "service_role";

grant truncate on table "public"."business_member" to "service_role";

grant update on table "public"."business_member" to "service_role";

CREATE TRIGGER update_filesquill_searchable_text BEFORE INSERT OR UPDATE ON public.filesquill FOR EACH ROW EXECUTE FUNCTION update_searchable_text();


