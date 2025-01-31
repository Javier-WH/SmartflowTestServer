create table public.folders (
  id uuid not null default gen_random_uuid (),
  name character varying(100) not null,
  container uuid null,
  created_at timestamp with time zone null default now(),
  constraint folders_pkey primary key (id),
  constraint folders_name_container_unique unique (name, container),
  constraint folders_container_fkey foreign KEY (container) references folders (id) on delete CASCADE,
  constraint check_self_container check (
    (
      (container is null)
      or (container <> id)
    )
  )
) TABLESPACE pg_default;