create table if not exists navigator.folders (
    id uuid primary key default uuid_generate_v4(),
    container uuid references navigator.folders(id) on delete set null on update cascade,
    name varchar(100) not null,
    created_at timestamp with time zone default now()
);



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "navigator"."folders";
