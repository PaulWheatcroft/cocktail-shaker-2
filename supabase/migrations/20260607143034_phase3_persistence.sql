-- Phase 3: profiles, cabinet, favourites, preferences, conversation history

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cabinet_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ingredient_name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, ingredient_name)
);

create table public.favourite_cocktails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  cocktail_id text not null,
  cocktail_name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, cocktail_id)
);

create table public.saved_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  house_strictness int not null default 50 check (house_strictness between 0 and 100),
  updated_at timestamptz not null default now()
);

create table public.conversation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  user_request text,
  created_at timestamptz not null default now()
);

create table public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.conversation_sessions (id) on delete cascade,
  role text not null check (role in ('user', 'hostess', 'system')),
  content jsonb not null,
  created_at timestamptz not null default now()
);

create index cabinet_items_user_id_idx on public.cabinet_items (user_id);
create index favourite_cocktails_user_id_idx on public.favourite_cocktails (user_id);
create index conversation_sessions_user_id_idx on public.conversation_sessions (user_id);
create index conversation_messages_session_id_idx on public.conversation_messages (session_id);

alter table public.profiles enable row level security;
alter table public.cabinet_items enable row level security;
alter table public.favourite_cocktails enable row level security;
alter table public.saved_preferences enable row level security;
alter table public.conversation_sessions enable row level security;
alter table public.conversation_messages enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "cabinet_items_select_own"
  on public.cabinet_items for select
  using (auth.uid() = user_id);

create policy "cabinet_items_insert_own"
  on public.cabinet_items for insert
  with check (auth.uid() = user_id);

create policy "cabinet_items_update_own"
  on public.cabinet_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "cabinet_items_delete_own"
  on public.cabinet_items for delete
  using (auth.uid() = user_id);

create policy "favourite_cocktails_select_own"
  on public.favourite_cocktails for select
  using (auth.uid() = user_id);

create policy "favourite_cocktails_insert_own"
  on public.favourite_cocktails for insert
  with check (auth.uid() = user_id);

create policy "favourite_cocktails_delete_own"
  on public.favourite_cocktails for delete
  using (auth.uid() = user_id);

create policy "saved_preferences_select_own"
  on public.saved_preferences for select
  using (auth.uid() = user_id);

create policy "saved_preferences_insert_own"
  on public.saved_preferences for insert
  with check (auth.uid() = user_id);

create policy "saved_preferences_update_own"
  on public.saved_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "conversation_sessions_select_own"
  on public.conversation_sessions for select
  using (auth.uid() = user_id);

create policy "conversation_sessions_insert_own"
  on public.conversation_sessions for insert
  with check (auth.uid() = user_id);

create policy "conversation_messages_select_own"
  on public.conversation_messages for select
  using (
    exists (
      select 1 from public.conversation_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "conversation_messages_insert_own"
  on public.conversation_messages for insert
  with check (
    exists (
      select 1 from public.conversation_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
