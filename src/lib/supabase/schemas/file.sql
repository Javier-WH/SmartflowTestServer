create or replace function public.generate_searchable_text(name text, content text)
returns text
language plpgsql immutable 
as $$
begin
    return lower(coalesce(name, '') || ' ' || coalesce(regexp_replace(regexp_replace(content, '<[^>]+>', ' ', 'gi'), '[^\w\sáéíóúáéíóúññ]', ' ', 'gi'), ''));
end;
$$;

create table if not exists public.filesquill (
    id uuid primary key default uuid_generate_v4(),
    name varchar(100) not null,
    container uuid references public.folders(id) on delete cascade on update cascade,
    content text,
    published boolean default false,
    organization_id uuid references public.organizations(id) on delete cascade on update cascade,
    "order" bigint default 0 not null,
    searchable_text text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create or replace function public.update_searchable_text()
returns trigger language plpgsql as $$
begin
    new.searchable_text := public.generate_searchable_text(new.name, new.content);
    return new;
end;
$$;

create table if not exists public.document_version_history (
    id uuid primary key default uuid_generate_v4(),
    document_id uuid not null references public.filesquill(id) on delete cascade on update cascade,
    name varchar(100) not null,
    content text not null,
    created_by text,
    created_at timestamp with time zone default now() not null
);

create or replace function public.create_file_quill(p_name character varying, p_container uuid default null::uuid, p_slug text default null::text)
    returns uuid
    language plpgsql
    as $$declare
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
end;$$;

create or replace function public.borrar_archivo_quill(p_file_id uuid) 
    returns table(itemid uuid, name varchar(100), container_id uuid, old_container_id uuid, old_container_empty boolean, "type" integer, published boolean, "order" bigint)
    language plpgsql
    as $$
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
$$;

create or replace function public.duplicate_filesquill_record(p_id uuid)
    returns uuid
    language plpgsql
    as $$
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
$$;

create or replace function public.move_file_quill(p_file_id uuid, p_new_container_id uuid)
    returns table(itemid uuid, name character varying, container_id uuid, old_container_id uuid, old_container_empty boolean, type integer, published boolean, "order" bigint)
    language plpgsql
    as $$

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
$$;

create or replace function public.move_file_to_root_quill(p_file_id uuid)
    returns table(itemid uuid, name character varying, container_id uuid, old_container_id uuid, old_container_empty boolean, type integer, published boolean, filesnumber character varying, "order" bigint)
    language plpgsql
    as $$

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
$$;

create or replace function public.partial_search_filesquill(search_term text, p_slug uuid)
    returns table(id uuid, name character varying, content text, searchtext text, container uuid, created_at timestamp with time zone, updated_at timestamp with time zone, similarity_score real, type integer)
    language plpgsql stable
    as $$
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
$$;
