create table if not exists material_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  item_key text not null,
  value text not null default '',
  updated_at timestamptz default now(),
  unique(user_id, item_key)
);
alter table material_responses enable row level security;

do $$ begin
  create policy "users own material responses" on material_responses
    for all using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
