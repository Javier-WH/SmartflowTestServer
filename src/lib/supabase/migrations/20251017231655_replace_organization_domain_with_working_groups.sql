drop trigger if exists "enviar_email_trigger" on "public"."organization_invitations";

drop trigger if exists "before_insert_organization_trigger" on "public"."organizations";

revoke delete on table "public"."organization_invitations" from "anon";

revoke insert on table "public"."organization_invitations" from "anon";

revoke references on table "public"."organization_invitations" from "anon";

revoke select on table "public"."organization_invitations" from "anon";

revoke trigger on table "public"."organization_invitations" from "anon";

revoke truncate on table "public"."organization_invitations" from "anon";

revoke update on table "public"."organization_invitations" from "anon";

revoke delete on table "public"."organization_invitations" from "authenticated";

revoke insert on table "public"."organization_invitations" from "authenticated";

revoke references on table "public"."organization_invitations" from "authenticated";

revoke select on table "public"."organization_invitations" from "authenticated";

revoke trigger on table "public"."organization_invitations" from "authenticated";

revoke truncate on table "public"."organization_invitations" from "authenticated";

revoke update on table "public"."organization_invitations" from "authenticated";

revoke delete on table "public"."organization_invitations" from "service_role";

revoke insert on table "public"."organization_invitations" from "service_role";

revoke references on table "public"."organization_invitations" from "service_role";

revoke select on table "public"."organization_invitations" from "service_role";

revoke trigger on table "public"."organization_invitations" from "service_role";

revoke truncate on table "public"."organization_invitations" from "service_role";

revoke update on table "public"."organization_invitations" from "service_role";

revoke delete on table "public"."organizations" from "anon";

revoke insert on table "public"."organizations" from "anon";

revoke references on table "public"."organizations" from "anon";

revoke select on table "public"."organizations" from "anon";

revoke trigger on table "public"."organizations" from "anon";

revoke truncate on table "public"."organizations" from "anon";

revoke update on table "public"."organizations" from "anon";

revoke delete on table "public"."organizations" from "authenticated";

revoke insert on table "public"."organizations" from "authenticated";

revoke references on table "public"."organizations" from "authenticated";

revoke select on table "public"."organizations" from "authenticated";

revoke trigger on table "public"."organizations" from "authenticated";

revoke truncate on table "public"."organizations" from "authenticated";

revoke update on table "public"."organizations" from "authenticated";

revoke delete on table "public"."organizations" from "service_role";

revoke insert on table "public"."organizations" from "service_role";

revoke references on table "public"."organizations" from "service_role";

revoke select on table "public"."organizations" from "service_role";

revoke trigger on table "public"."organizations" from "service_role";

revoke truncate on table "public"."organizations" from "service_role";

revoke update on table "public"."organizations" from "service_role";

revoke delete on table "public"."organizations_users" from "anon";

revoke insert on table "public"."organizations_users" from "anon";

revoke references on table "public"."organizations_users" from "anon";

revoke select on table "public"."organizations_users" from "anon";

revoke trigger on table "public"."organizations_users" from "anon";

revoke truncate on table "public"."organizations_users" from "anon";

revoke update on table "public"."organizations_users" from "anon";

revoke delete on table "public"."organizations_users" from "authenticated";

revoke insert on table "public"."organizations_users" from "authenticated";

revoke references on table "public"."organizations_users" from "authenticated";

revoke select on table "public"."organizations_users" from "authenticated";

revoke trigger on table "public"."organizations_users" from "authenticated";

revoke truncate on table "public"."organizations_users" from "authenticated";

revoke update on table "public"."organizations_users" from "authenticated";

revoke delete on table "public"."organizations_users" from "service_role";

revoke insert on table "public"."organizations_users" from "service_role";

revoke references on table "public"."organizations_users" from "service_role";

revoke select on table "public"."organizations_users" from "service_role";

revoke trigger on table "public"."organizations_users" from "service_role";

revoke truncate on table "public"."organizations_users" from "service_role";

revoke update on table "public"."organizations_users" from "service_role";

alter table "public"."filesquill" drop constraint "filesquill_organization_id_fkey";

alter table "public"."folders" drop constraint "folders_name_container_organization_id_key";

alter table "public"."folders" drop constraint "folders_organization_id_fkey";

alter table "public"."organization_invitations" drop constraint "organization_invitations_invited_by_fkey";

alter table "public"."organization_invitations" drop constraint "organization_invitations_level_id_fkey";

alter table "public"."organization_invitations" drop constraint "organization_invitations_organization_id_fkey";

alter table "public"."organizations" drop constraint "organizations_name_user_id_key";

alter table "public"."organizations" drop constraint "organizations_slug_key";

alter table "public"."organizations" drop constraint "organizations_user_id_fkey";

alter table "public"."organizations_users" drop constraint "organizations_users_organization_id_fkey";

alter table "public"."organizations_users" drop constraint "organizations_users_roll_id_fkey";

alter table "public"."organizations_users" drop constraint "organizations_users_user_id_fkey";

alter table "public"."organizations_users" drop constraint "organizations_users_user_id_organization_id_key";

drop function if exists "public"."before_insert_organization"();

drop function if exists "public"."clone_organization"(original_org_id uuid, new_org_name character varying, new_org_slug character varying);

drop function if exists "public"."get_user_organizations"(p_user_id uuid, p_name text, p_page integer, p_page_size integer);

drop function if exists "public"."getmembers"(a_organization_id uuid);

drop function if exists "public"."is_user_in_organization"(p_email text, p_organization_id uuid);

drop function if exists "public"."spreadtutorial"(p_organization_id uuid, p_role_id uuid);

alter table "public"."organization_invitations" drop constraint "organization_invitations_pkey";

alter table "public"."organizations" drop constraint "organizations_pkey";

alter table "public"."organizations_users" drop constraint "organizations_users_pkey";

drop index if exists "public"."folders_name_container_organization_id_key";

drop index if exists "public"."organization_invitations_pkey";

drop index if exists "public"."organizations_name_user_id_key";

drop index if exists "public"."organizations_pkey";

drop index if exists "public"."organizations_slug_key";

drop index if exists "public"."organizations_users_pkey";

drop index if exists "public"."organizations_users_user_id_organization_id_key";

-- drop table "public"."organization_invitations";
--
-- drop table "public"."organizations";
--
-- drop table "public"."organizations_users";
--
-- create table "public"."working_group" (
--     "id" uuid not null default uuid_generate_v4(),
--     "user_id" uuid not null,
--     "name" character varying(100) not null,
--     "description" text not null,
--     "slug" character varying(50) not null,
--     "open" boolean not null default true,
--     "created_at" timestamp with time zone not null default now()
-- );
--
--
-- create table "public"."working_group_invitations" (
--     "id" uuid not null default uuid_generate_v4(),
--     "level_id" uuid not null,
--     "working_group_id" uuid not null,
--     "invited_by" uuid not null,
--     "email" character varying(100) not null,
--     "status" character varying(50) not null,
--     "created_at" timestamp without time zone default now()
-- );
--
--
-- create table "public"."working_group_users" (
--     "id" uuid not null default uuid_generate_v4(),
--     "user_id" uuid not null,
--     "working_group_id" uuid not null,
--     "roll_id" uuid not null,
--     "created_at" timestamp with time zone not null default now()
-- );

alter table "public"."organization_invitations" rename to "working_group_invitations";

alter table "public"."organizations" rename to "working_group";

alter table "public"."organizations_users" rename to "working_group_users";

alter table "public"."working_group_invitations" rename column "organization_id" to "working_group_id";

alter table "public"."working_group_users" rename column "organization_id" to "working_group_id";

-- alter table "public"."filesquill" drop column "organization_id";

-- alter table "public"."filesquill" add column "working_group_id" uuid;

-- alter table "public"."folders" drop column "organization_id";

-- alter table "public"."folders" add column "working_group_id" uuid not null;

alter table "public"."filesquill" rename column "organization_id" to "working_group_id";

alter table "public"."folders" rename column "organization_id" to "working_group_id";

CREATE UNIQUE INDEX folders_name_container_working_group_id_key ON public.folders USING btree (name, container, working_group_id);

CREATE UNIQUE INDEX working_group_invitations_pkey ON public.working_group_invitations USING btree (id);

CREATE UNIQUE INDEX working_group_name_user_id_key ON public.working_group USING btree (name, user_id);

CREATE UNIQUE INDEX working_group_pkey ON public.working_group USING btree (id);

CREATE UNIQUE INDEX working_group_slug_key ON public.working_group USING btree (slug);

CREATE UNIQUE INDEX working_group_users_pkey ON public.working_group_users USING btree (id);

CREATE UNIQUE INDEX working_group_users_user_id_working_group_id_key ON public.working_group_users USING btree (user_id, working_group_id);

alter table "public"."working_group" add constraint "working_group_pkey" PRIMARY KEY using index "working_group_pkey";

alter table "public"."working_group_invitations" add constraint "working_group_invitations_pkey" PRIMARY KEY using index "working_group_invitations_pkey";

alter table "public"."working_group_users" add constraint "working_group_users_pkey" PRIMARY KEY using index "working_group_users_pkey";

alter table "public"."filesquill" add constraint "filesquill_working_group_id_fkey" FOREIGN KEY (working_group_id) REFERENCES working_group(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."filesquill" validate constraint "filesquill_working_group_id_fkey";

alter table "public"."folders" add constraint "folders_name_container_working_group_id_key" UNIQUE using index "folders_name_container_working_group_id_key";

alter table "public"."folders" add constraint "folders_working_group_id_fkey" FOREIGN KEY (working_group_id) REFERENCES working_group(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."folders" validate constraint "folders_working_group_id_fkey";

alter table "public"."working_group" add constraint "working_group_name_user_id_key" UNIQUE using index "working_group_name_user_id_key";

alter table "public"."working_group" add constraint "working_group_slug_key" UNIQUE using index "working_group_slug_key";

alter table "public"."working_group" add constraint "working_group_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."working_group" validate constraint "working_group_user_id_fkey";

alter table "public"."working_group_invitations" add constraint "working_group_invitations_invited_by_fkey" FOREIGN KEY (invited_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."working_group_invitations" validate constraint "working_group_invitations_invited_by_fkey";

alter table "public"."working_group_invitations" add constraint "working_group_invitations_level_id_fkey" FOREIGN KEY (level_id) REFERENCES rolls(id) ON DELETE CASCADE not valid;

alter table "public"."working_group_invitations" validate constraint "working_group_invitations_level_id_fkey";

alter table "public"."working_group_invitations" add constraint "working_group_invitations_working_group_id_fkey" FOREIGN KEY (working_group_id) REFERENCES working_group(id) ON DELETE CASCADE not valid;

alter table "public"."working_group_invitations" validate constraint "working_group_invitations_working_group_id_fkey";

alter table "public"."working_group_users" add constraint "working_group_users_roll_id_fkey" FOREIGN KEY (roll_id) REFERENCES rolls(id) ON UPDATE CASCADE not valid;

alter table "public"."working_group_users" validate constraint "working_group_users_roll_id_fkey";

alter table "public"."working_group_users" add constraint "working_group_users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."working_group_users" validate constraint "working_group_users_user_id_fkey";

alter table "public"."working_group_users" add constraint "working_group_users_user_id_working_group_id_key" UNIQUE using index "working_group_users_user_id_working_group_id_key";

alter table "public"."working_group_users" add constraint "working_group_users_working_group_id_fkey" FOREIGN KEY (working_group_id) REFERENCES working_group(id) ON DELETE CASCADE not valid;

alter table "public"."working_group_users" validate constraint "working_group_users_working_group_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.before_insert_working_group()
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
    select exists(select 1 from working_group where slug = random_slug) into slug_exists;
    
    -- exit the loop if the slug is unique
    exit when not slug_exists;
  end loop;
  
  -- set the slug value
  new.slug := random_slug;
  
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.clone_working_group(original_org_id uuid, new_org_name character varying, new_org_slug character varying)
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

    -- 1. crear nuevo grupo de trabajo
    insert into working_group (name, description, slug, open, user_id)
    select new_org_name, description, new_org_slug, open, user_id
    from working_group 
    where id = original_org_id
    returning id into new_org_id;

    -- 2. clonar usuarios del grupo de trabajo
    insert into working_group_users (user_id, working_group_id, roll_id)
    select user_id, new_org_id, roll_id
    from working_group_users 
    where working_group_id = original_org_id;

    -- 3. clonar carpetas usando enfoque recursivo
    -- primero las carpetas raz (container is null)
    for folder_record in 
        select * from folders 
        where working_group_id = original_org_id 
        and container is null
        order by created_at
    loop
        insert into folders (name, container, working_group_id)
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
            where f.working_group_id = original_org_id 
            and f.container is not null
            and f.id not in (select old_folder_id from folder_mapping)
            and f.container in (select old_folder_id from folder_mapping)
        loop
            -- obtener el nuevo id del contenedor (usando alias para evitar ambigedad)
            select fm.new_folder_id into mapped_folder_id 
            from folder_mapping fm
            where fm.old_folder_id = folder_record.container;
            
            insert into folders (name, container, working_group_id)
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
        where f.working_group_id = original_org_id
    loop
        if file_record.container is not null then
            select fm.new_folder_id into mapped_folder_id
            from folder_mapping fm
            where fm.old_folder_id = file_record.container;
        else
            mapped_folder_id := null;
        end if;

        insert into filesquill (name, container, content, published, working_group_id)
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

CREATE OR REPLACE FUNCTION public.get_user_working_groups(p_user_id uuid, p_name text DEFAULT NULL::text, p_page integer DEFAULT 1, p_page_size integer DEFAULT 10)
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
  from working_group o
  left join working_group_users ou on o.id = ou.working_group_id
  where o.open = true
    and (o.user_id = p_user_id or ou.user_id = p_user_id)
    and (p_name is null or o.name ilike '%' || p_name || '%');
  
  -- return the working_group with pagination
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
    from working_group o
    left join working_group_users ou on o.id = ou.working_group_id and ou.user_id = p_user_id
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

CREATE OR REPLACE FUNCTION public.getmembers(a_working_group_id uuid)
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
    from public.working_group_users ou
    join auth.users u on ou.user_id = u.id
    join public.rolls r on ou.roll_id = r.id
    where ou.working_group_id = a_working_group_id; 
end;
$function$
;

CREATE OR REPLACE FUNCTION public.is_user_in_working_group(p_email text, p_working_group_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
    v_is_member boolean;
begin
    -- check if a user with the given email exists and is in the specified working_group.
    -- we join with auth.users to get the user id from the email.
    select exists (
        select 1
        from public.working_group_users as ou
        inner join auth.users as au on ou.user_id = au.id
        where au.email = p_email and ou.working_group_id = p_working_group_id
    ) into v_is_member;

    return v_is_member;

exception
    -- if any other error occurs, return false.
    when others then
        return false;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.spreadtutorial(p_working_group_id uuid, p_role_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
    insert into public.working_group_users (user_id, working_group_id, roll_id)
    select
        u.id,
        p_working_group_id,
        p_role_id
    from
        auth.users u
    where
        -- la clusula 'not exists' se asegura de que solo seleccionemos usuarios
        -- que no tengan ya un registro en 'working_group_users' para este grupo de trabajo
        not exists (
            select 1
            from public.working_group_users ou
            where ou.user_id = u.id
            and ou.working_group_id = p_working_group_id
        );
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
    and working_group_id = new.working_group_id
    and container is null;
  
    if found then
      raise exception 'folder with name "%" already exists with root container', new.name;
    end if;
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.crear_carpeta(p_foldername character varying, p_container_id uuid, p_slug text)
 RETURNS TABLE(itemid uuid, name character varying, container_id uuid, type integer, published boolean)
 LANGUAGE plpgsql
AS $function$
declare
    p_working_group_id uuid;
begin
    -- 0. obtener el id del grupo de trabajo

    select o.id into p_working_group_id from public.working_group o where o.slug = p_slug;

    -- 1. insertar la carpeta
    insert into public.folders (name, container, working_group_id) 
    values (p_foldername, p_container_id, p_working_group_id);

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
  p_working_group_id uuid;
begin
  -- obtener el working_group_id usando el slug

    select o.id into p_working_group_id from public.working_group o where o.slug =  p_slug;

  -- insertar el registro manejando el caso especial para container
  insert into public.filesquill(name, container, working_group_id, content)
  values (
    p_name,
    case 
      when p_container is null then null
      else p_container
    end,
    p_working_group_id,
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
        working_group_id
    )
    select
        gen_random_uuid(),
        name,
        container,
        content,
        published,
        working_group_id
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
  -- obtener datos del grupo de trabajo
  select o.name, o.description into org_name, org_description
  from public.working_group o
  where o.id = new.working_group_id;

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
      'subject', 'Invitación a grupo de trabajo',
      'html', format('
        <div style=background:#f0f0f0; padding:20px;>
          <h1>%s</h1>
          <h5>%s</h5>

          <p>this email has been sent to invite you to join this working_group.</p>
          <p>if you did not request to join the working_group, you can ignore this email.</p>
        
          <a href=https://smartflo.pro/join/%s 
             style=background:#007bff; color:white; padding:10px 20px; text-decoration:none;>
            go to working_group join page
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

CREATE OR REPLACE FUNCTION public.getfoldercontentquill(p_folder_id uuid, p_slug text)
 RETURNS TABLE(id uuid, name character varying, type integer, published boolean, filesnumber character varying, "order" bigint)
 LANGUAGE plpgsql
AS $function$
declare
    p_working_group_id uuid;
begin
    -- obtengo el id del grupo de trabajo usando el slug
    select o.id into p_working_group_id from public.working_group o where o.slug = p_slug;
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
        (p_folder_id is null and f.container is null and f.working_group_id = p_working_group_id)  -- manejo de null
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
        (p_folder_id is null and a.container is null and a.working_group_id = p_working_group_id)  -- manejo de null
        or a.container = p_folder_id;                  -- caso normal
end;
$function$
;

CREATE OR REPLACE FUNCTION public.getrootcontentquillfiltered(p_slug text)
 RETURNS TABLE(id uuid, name character varying, type integer, published boolean, filesnumber character varying, "order" bigint)
 LANGUAGE plpgsql
AS $function$
declare
    p_working_group_id uuid;
begin
    -- se obtiene el id del grupo de trabajo usando el slug
    select o.id into p_working_group_id from public.working_group o where o.slug = p_slug;
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
        f.working_group_id = p_working_group_id and
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
        a.working_group_id = p_working_group_id and
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
  -- insertar un nuevo registro en la tabla working_group_users.
  -- new es una variable especial que contiene el nuevo registro insertado en auth.users.
  insert into public.working_group_users (user_id, working_group_id, roll_id)
  values (
    new.id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    '20d09d54-eb0b-498e-a6fa-910f598eec77'
  );

  return new; -- la funcin debe retornar new para triggers after insert.
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
    where f.working_group_id = p_slug
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
    where x.working_group_id = p_slug
      and (x.name %> clean_search_term or x.name ilike '%' || clean_search_term || '%')
    order by similarity_score desc
    limit subquery_limit)

    order by similarity_score desc, type desc
    limit 100;
end;
$function$
;

grant delete on table "public"."working_group" to "anon";

grant insert on table "public"."working_group" to "anon";

grant references on table "public"."working_group" to "anon";

grant select on table "public"."working_group" to "anon";

grant trigger on table "public"."working_group" to "anon";

grant truncate on table "public"."working_group" to "anon";

grant update on table "public"."working_group" to "anon";

grant delete on table "public"."working_group" to "authenticated";

grant insert on table "public"."working_group" to "authenticated";

grant references on table "public"."working_group" to "authenticated";

grant select on table "public"."working_group" to "authenticated";

grant trigger on table "public"."working_group" to "authenticated";

grant truncate on table "public"."working_group" to "authenticated";

grant update on table "public"."working_group" to "authenticated";

grant delete on table "public"."working_group" to "service_role";

grant insert on table "public"."working_group" to "service_role";

grant references on table "public"."working_group" to "service_role";

grant select on table "public"."working_group" to "service_role";

grant trigger on table "public"."working_group" to "service_role";

grant truncate on table "public"."working_group" to "service_role";

grant update on table "public"."working_group" to "service_role";

grant delete on table "public"."working_group_invitations" to "anon";

grant insert on table "public"."working_group_invitations" to "anon";

grant references on table "public"."working_group_invitations" to "anon";

grant select on table "public"."working_group_invitations" to "anon";

grant trigger on table "public"."working_group_invitations" to "anon";

grant truncate on table "public"."working_group_invitations" to "anon";

grant update on table "public"."working_group_invitations" to "anon";

grant delete on table "public"."working_group_invitations" to "authenticated";

grant insert on table "public"."working_group_invitations" to "authenticated";

grant references on table "public"."working_group_invitations" to "authenticated";

grant select on table "public"."working_group_invitations" to "authenticated";

grant trigger on table "public"."working_group_invitations" to "authenticated";

grant truncate on table "public"."working_group_invitations" to "authenticated";

grant update on table "public"."working_group_invitations" to "authenticated";

grant delete on table "public"."working_group_invitations" to "service_role";

grant insert on table "public"."working_group_invitations" to "service_role";

grant references on table "public"."working_group_invitations" to "service_role";

grant select on table "public"."working_group_invitations" to "service_role";

grant trigger on table "public"."working_group_invitations" to "service_role";

grant truncate on table "public"."working_group_invitations" to "service_role";

grant update on table "public"."working_group_invitations" to "service_role";

grant delete on table "public"."working_group_users" to "anon";

grant insert on table "public"."working_group_users" to "anon";

grant references on table "public"."working_group_users" to "anon";

grant select on table "public"."working_group_users" to "anon";

grant trigger on table "public"."working_group_users" to "anon";

grant truncate on table "public"."working_group_users" to "anon";

grant update on table "public"."working_group_users" to "anon";

grant delete on table "public"."working_group_users" to "authenticated";

grant insert on table "public"."working_group_users" to "authenticated";

grant references on table "public"."working_group_users" to "authenticated";

grant select on table "public"."working_group_users" to "authenticated";

grant trigger on table "public"."working_group_users" to "authenticated";

grant truncate on table "public"."working_group_users" to "authenticated";

grant update on table "public"."working_group_users" to "authenticated";

grant delete on table "public"."working_group_users" to "service_role";

grant insert on table "public"."working_group_users" to "service_role";

grant references on table "public"."working_group_users" to "service_role";

grant select on table "public"."working_group_users" to "service_role";

grant trigger on table "public"."working_group_users" to "service_role";

grant truncate on table "public"."working_group_users" to "service_role";

grant update on table "public"."working_group_users" to "service_role";

CREATE TRIGGER before_insert_working_group_trigger BEFORE INSERT ON public.working_group FOR EACH ROW WHEN (((new.slug IS NULL) OR ((new.slug)::text = ''::text))) EXECUTE FUNCTION before_insert_working_group();

CREATE TRIGGER enviar_email_trigger AFTER INSERT ON public.working_group_invitations FOR EACH ROW EXECUTE FUNCTION enviar_email();


