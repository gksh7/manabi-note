alter table public.tags add column if not exists created_by uuid references public.profiles(id) on delete set null;
create index if not exists tags_created_by_created_at_idx on public.tags(created_by, created_at desc);

create or replace function public.create_note_with_tags(
  p_title text,
  p_body text,
  p_is_public boolean,
  p_tags text[] default array[]::text[]
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_note_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;
  if (select count(distinct lower(btrim(tag))) from unnest(coalesce(p_tags, array[]::text[])) as tag where char_length(btrim(tag)) between 1 and 30) > 10 then
    raise exception 'A note can have at most 10 tags';
  end if;
  if (select count(*) from public.tags where created_by = auth.uid() and created_at >= now() - interval '1 day') >= 50 then
    raise exception 'Daily tag creation limit reached';
  end if;

  insert into public.notes (user_id, title, body, is_public)
  values (auth.uid(), p_title, p_body, p_is_public)
  returning id into v_note_id;

  with input_tags as (
    select distinct btrim(tag) as name
    from unnest(coalesce(p_tags, array[]::text[])) as tag
    where char_length(btrim(tag)) between 1 and 30
  )
  insert into public.tags (name, created_by)
  select name, auth.uid() from input_tags
  on conflict (normalized_name) do nothing;

  with input_tags as (
    select distinct lower(btrim(tag)) as normalized_name
    from unnest(coalesce(p_tags, array[]::text[])) as tag
    where char_length(btrim(tag)) between 1 and 30
  )
  insert into public.note_tags (note_id, tag_id)
  select v_note_id, tags.id
  from public.tags as tags
  join input_tags using (normalized_name);

  return v_note_id;
end;
$$;

create or replace function public.update_note_with_tags(
  p_note_id uuid,
  p_title text,
  p_body text,
  p_is_public boolean,
  p_tags text[] default array[]::text[]
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;
  if (select count(distinct lower(btrim(tag))) from unnest(coalesce(p_tags, array[]::text[])) as tag where char_length(btrim(tag)) between 1 and 30) > 10 then
    raise exception 'A note can have at most 10 tags';
  end if;
  if (select count(*) from public.tags where created_by = auth.uid() and created_at >= now() - interval '1 day') >= 50 then
    raise exception 'Daily tag creation limit reached';
  end if;

  update public.notes
  set title = p_title, body = p_body, is_public = p_is_public
  where id = p_note_id and user_id = auth.uid();

  if not found then
    raise exception 'Note not found';
  end if;

  delete from public.note_tags where note_id = p_note_id;

  with input_tags as (
    select distinct btrim(tag) as name
    from unnest(coalesce(p_tags, array[]::text[])) as tag
    where char_length(btrim(tag)) between 1 and 30
  )
  insert into public.tags (name, created_by)
  select name, auth.uid() from input_tags
  on conflict (normalized_name) do nothing;

  with input_tags as (
    select distinct lower(btrim(tag)) as normalized_name
    from unnest(coalesce(p_tags, array[]::text[])) as tag
    where char_length(btrim(tag)) between 1 and 30
  )
  insert into public.note_tags (note_id, tag_id)
  select p_note_id, tags.id
  from public.tags as tags
  join input_tags using (normalized_name);
end;
$$;

revoke all on function public.create_note_with_tags(text, text, boolean, text[]) from public, anon;
revoke all on function public.update_note_with_tags(uuid, text, text, boolean, text[]) from public, anon;
revoke insert on table public.tags from authenticated;
revoke insert on table public.note_tags from authenticated;
grant execute on function public.create_note_with_tags(text, text, boolean, text[]) to authenticated;
grant execute on function public.update_note_with_tags(uuid, text, text, boolean, text[]) to authenticated;

-- Tag/note-tag creation must go through the RPCs above (they enforce the
-- 10-tags-per-note and daily-creation limits); drop the now-unreachable
-- direct-insert policies so a future re-grant doesn't silently reopen them.
drop policy if exists "authenticated users create shared tags" on public.tags;
drop policy if exists "owners create note tag links" on public.note_tags;
