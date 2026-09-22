create extension if not exists pgcrypto;
create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 50),
  bio text not null default '' check (char_length(bio) <= 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  body text not null check (char_length(body) between 1 and 10000),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index notes_user_id_idx on public.notes(user_id);
create index notes_public_updated_idx on public.notes(is_public, updated_at desc);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 30),
  normalized_name text generated always as (lower(btrim(name))) stored unique,
  created_at timestamptz not null default now()
);

create table public.note_tags (
  note_id uuid not null references public.notes(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (note_id, tag_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index comments_note_id_created_idx on public.comments(note_id, created_at);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger notes_updated_at before update on public.notes for each row execute function public.set_updated_at();
create trigger comments_updated_at before update on public.comments for each row execute function public.set_updated_at();

create or replace function private.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.profiles (id, display_name) values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))); return new; end; $$;
revoke all on function private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.notes enable row level security;
alter table public.tags enable row level security;
alter table public.note_tags enable row level security;
alter table public.comments enable row level security;

create policy "authenticated profiles are readable" on public.profiles for select to authenticated using (true);
create policy "users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "authenticated users read public or own notes" on public.notes for select to authenticated using (is_public or (select auth.uid()) = user_id);
create policy "users create own notes" on public.notes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users update own notes" on public.notes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users delete own notes" on public.notes for delete to authenticated using ((select auth.uid()) = user_id);

create policy "authenticated users read shared tags" on public.tags for select to authenticated using (true);
create policy "authenticated users create shared tags" on public.tags for insert to authenticated with check (true);

create policy "users read tag links for visible notes" on public.note_tags for select to authenticated using (exists (select 1 from public.notes n where n.id = note_id and (n.is_public or n.user_id = (select auth.uid()))));
create policy "owners create note tag links" on public.note_tags for insert to authenticated with check (exists (select 1 from public.notes n where n.id = note_id and n.user_id = (select auth.uid())));
create policy "owners delete note tag links" on public.note_tags for delete to authenticated using (exists (select 1 from public.notes n where n.id = note_id and n.user_id = (select auth.uid())));

create policy "authenticated users read comments on public notes" on public.comments for select to authenticated using (exists (select 1 from public.notes n where n.id = note_id and n.is_public));
create policy "authenticated users comment on public notes" on public.comments for insert to authenticated with check ((select auth.uid()) = user_id and exists (select 1 from public.notes n where n.id = note_id and n.is_public));
create policy "authors delete own comments" on public.comments for delete to authenticated using ((select auth.uid()) = user_id or exists (select 1 from public.notes n where n.id = note_id and n.user_id = (select auth.uid())));

revoke all on table public.profiles, public.notes, public.tags, public.note_tags, public.comments from anon;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.notes to authenticated;
grant select, insert on public.tags to authenticated;
grant select, insert, delete on public.note_tags to authenticated;
grant select, insert, delete on public.comments to authenticated;
