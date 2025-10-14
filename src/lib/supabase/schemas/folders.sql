-- Folders domain schema
-- Contains tables for managing folder hierarchy and organization

-- Folders table with hierarchical structure
create table public.folders (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null,
    container uuid references public.folders(id) on delete cascade,
    created_at timestamp with time zone default now(),
    organization_id uuid references public.organizations(id) on delete cascade,
    constraint check_self_container check ((container is null or container <> id)),
    unique(name, container, organization_id)
);

-- Enable Row Level Security
alter table public.folders enable row level security;

-- Add triggers for folder constraints
create trigger before_insert_or_update_folder
    before insert or update on public.folders
    for each row execute function public.check_folder_constraints();

create trigger prevent_folder_cycle
    before insert or update on public.folders
    for each row execute function public.check_folder_cycle();