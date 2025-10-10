create table public.business (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade on update cascade not null,
    name varchar(50) not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.business_member (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid references public.business(id) on delete cascade on update cascade not null,
    user_id uuid references auth.users(id) on delete cascade on update cascade not null,
    role_id uuid references public.rolls(id) on delete set null on update cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(business_id, user_id)
);

alter table public.business enable row level security;
alter table public.business_member enable row level security;

create view public.business_with_members as
select 
    b.id,
    b.user_id,
    b.name,
    b.description,
    b.created_at,
    json_agg(
        json_build_object(
            'id', bm.id,
            'user_id', bm.user_id,
            'role_id', bm.role_id,
            'created_at', bm.created_at
        )
    ) as members
from public.business b
left join public.business_member bm on b.id = bm.business_id
group by b.id, b.user_id, b.name, b.description, b.created_at;
