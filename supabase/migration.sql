create table if not exists module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  item_id text not null,
  completed_at timestamptz default now(),
  unique(user_id, item_id)
);
alter table module_progress enable row level security;
create policy "users own progress" on module_progress
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists checklist_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  item_key text not null,
  checked boolean default true,
  updated_at timestamptz default now(),
  unique(user_id, item_key)
);
alter table checklist_progress enable row level security;
create policy "users own checklist" on checklist_progress
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
