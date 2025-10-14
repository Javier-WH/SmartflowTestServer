-- Documents domain schema
-- Contains tables for managing files, documents, and version history

-- Basic files table (legacy)
create table public.files (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null,
    container uuid references public.folders(id) on delete cascade,
    created_at timestamp with time zone default now(),
    content jsonb,
    published boolean default false
);

-- Quill-based files table with enhanced features
create table public.filesquill (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null,
    container uuid references public.folders(id) on delete cascade,
    created_at timestamp with time zone default now(),
    content text,
    published boolean default false,
    updated_at timestamp with time zone default now(),
    organization_id uuid references public.organizations(id) on delete cascade,
    searchable_text text generated always as ((coalesce(name, '')::text || ' '::text || coalesce(regexp_replace(content, '<[^>]+>', '', 'gi'), ''::text))) stored
);

-- Document version history table
create table public.document_version_history (
    id uuid primary key default gen_random_uuid(),
    document_id uuid default gen_random_uuid() not null references public.filesquill(id) on update cascade on delete cascade,
    name varchar not null,
    content text not null,
    created_at timestamp without time zone default now() not null,
    created_by text
);

-- Create index for full-text search on filesquill
create index idx_filesquill_trgm_search on public.filesquill using gin (searchable_text public.gin_trgm_ops);

-- Enable Row Level Security
alter table public.files enable row level security;
alter table public.filesquill enable row level security;
alter table public.document_version_history enable row level security;

-- Add trigger for updating updated_at column
create trigger before_update_updated_at_column
    before update on public.filesquill
    for each row execute function storage.update_updated_at_column();