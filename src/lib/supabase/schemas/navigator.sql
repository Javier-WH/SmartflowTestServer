-- Navigator domain schema
-- Contains tables for the navigator schema (separate from public)

-- Create navigator schema if it doesn't exist
create schema if not exists navigator;

-- Navigator folders table (separate from public.folders)
create table if not exists navigator.folders (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null,
    container uuid references navigator.folders(id) on delete set null,
    created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table navigator.folders enable row level security;