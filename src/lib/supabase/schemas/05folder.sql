create table if not exists public.folders (
    id uuid primary key default uuid_generate_v4(),
    container uuid references public.folders(id) on delete cascade on update cascade,
    working_group_id uuid references public.working_group(id) on delete cascade on update cascade not null,
    name varchar(100) not null,
    "order" bigint default 0 not null,
    created_at timestamp with time zone default now(),
    unique(name, container, working_group_id)
);

create or replace function public.crear_carpeta(p_foldername varchar(100), p_container_id uuid, p_slug text)
    returns table(itemid uuid, name varchar(100), container_id uuid, type integer, published boolean)
    language plpgsql
    as $$
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
$$;

create or replace function public.actualizar_carpeta(p_foldername varchar(100), p_id uuid)
    returns table(itemid uuid, name varchar(100), container_id uuid, type integer, published boolean)
    language plpgsql
    as $$
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
$$;

create or replace function public.actualizar_carpeta_root(p_foldername varchar(100), p_id uuid) 
    returns table(itemid uuid, name varchar(100), container_id uuid, type integer, published boolean)
    language plpgsql
    as $$
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
$$;

create or replace function public.borrar_carpeta(p_folder_id uuid) 
    returns table(itemid uuid, name character varying, container_id uuid, old_container_id uuid, old_container_empty boolean, type integer, published boolean, "order" bigint)
    language plpgsql
    as $$
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
$$;

create or replace function public.check_folder_constraints() 
    returns trigger
    language plpgsql
    as $$
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
$$;

create or replace function public.check_folder_cycle()
    returns trigger
    language plpgsql
    as $$
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
$$;

create or replace function public.get_folder_path_contents(p_folder_id uuid)
    returns table(id uuid, name character varying, type integer, published boolean)
    language plpgsql
    as $$
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
$$;

create or replace function public.getfilescount(p_folder_id uuid)
    returns table(filesnumber character varying)
    language plpgsql
    as $$
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
$$;

create or replace function public.getfoldercontentquill(p_folder_id uuid, p_slug text)
    returns table(id uuid, name character varying, type integer, published boolean, filesnumber character varying, "order" bigint)
    language plpgsql
    as $$
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
$$;

create or replace function public.gethierarchyfoldercontent(p_folder_id uuid, p_slug text)
    returns table(itemid uuid, name character varying, type integer, published boolean, level integer, container_id uuid)
    language plpgsql
    as $$
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
$$;

create or replace function public.move_folder_to_root(p_folder_id uuid)
    returns table(itemid uuid, name character varying, container_id uuid, old_container_id uuid, old_container_empty boolean, type integer, published boolean, "order" bigint)
    language plpgsql
    as $$

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
$$;

create or replace function public.mover_carpeta(p_folder_id uuid, p_new_container_id uuid)
    returns table(itemid uuid, name character varying, container_id uuid, old_container_id uuid, old_container_empty boolean, type integer, published boolean, "order" bigint)
    language plpgsql
    as $$
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
$$;
