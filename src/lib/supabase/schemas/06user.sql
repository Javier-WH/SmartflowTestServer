create or replace function public.get_user_working_groups(p_user_id uuid, p_name text default null::text, p_page integer default 1, p_page_size integer default 10)
    returns table(id uuid, name character varying, description text, slug character varying, open boolean, created_at timestamp with time zone, user_id uuid, is_creator boolean, is_member boolean, leveltitle character varying, read boolean, write boolean, delete boolean, invite boolean, configure boolean, total_count bigint)
    language plpgsql
    as $$
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
$$;

create or replace function public.handle_new_user()
    returns trigger
    language plpgsql security definer
    as $$
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
$$;

create or replace function public.is_user_in_working_group(p_email text, p_working_group_id uuid)
    returns boolean
    language plpgsql security definer
    as $$
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
$$;
