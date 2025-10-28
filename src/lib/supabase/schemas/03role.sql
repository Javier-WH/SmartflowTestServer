create table if not exists public.rolls (
    id uuid primary key default uuid_generate_v4(),
    "level" varchar(100) not null unique,
    read boolean not null,
    write boolean not null,
    "delete" boolean not null,
    invite boolean default false not null,
    configure boolean
);
