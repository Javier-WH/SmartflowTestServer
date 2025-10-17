create table if not exists public.organizations (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    name varchar(100) not null,
    description text not null,
    slug varchar(50) not null unique,
    open boolean default true not null,
    created_at timestamp with time zone default now() not null,
    unique(name, user_id)
);

create table if not exists public.organizations_users (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    organization_id uuid references public.organizations(id) on delete cascade not null,
    roll_id uuid references public.rolls(id) on update cascade not null,
    created_at timestamp with time zone default now() not null,
    unique(user_id, organization_id)
);


create table if not exists public.organization_invitations (
    id uuid primary key default uuid_generate_v4(),
    level_id uuid references public.rolls(id) on delete cascade not null,
    organization_id uuid references public.organizations(id) on delete cascade not null,
    invited_by uuid references auth.users(id) on delete cascade not null,
    email varchar(100) not null,
    status varchar(50) not null,
    created_at timestamp without time zone default now()
);

create or replace function public.spreadtutorial(p_organization_id uuid, p_role_id uuid) 
    returns void
    language plpgsql
    as $$
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
$$;

create or replace function public.before_insert_organization() 
    returns trigger
    language plpgsql
    as $$
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
$$;

create or replace function public.clone_organization(original_org_id uuid, new_org_name character varying, new_org_slug character varying)
    returns uuid
    language plpgsql security definer
    as $$
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
$$;

create or replace function public.getmembers(a_organization_id uuid)
    returns table(userid uuid, useremail character varying, rollid uuid, rollname character varying)
    language plpgsql security definer
    as $$
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
$$;

create or replace function public.getrootcontentquill()
    returns table(id uuid, name character varying, type integer, published boolean, filesnumber character varying)
    language plpgsql
    as $$
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
$$;

create or replace function public.getrootcontentquillfiltered(p_slug text)
    returns table(id uuid, name character varying, type integer, published boolean, filesnumber character varying, "order" bigint)
    language plpgsql
    as $$
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
$$;
