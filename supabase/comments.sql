create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(trim(content)) >= 1),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_post_comments_post_id_created_at on public.post_comments (post_id, created_at asc);
create index if not exists idx_post_comments_author_id on public.post_comments (author_id);

create or replace function public.sync_post_comment_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts
    set comments_count = comments_count + 1
    where id = new.post_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.posts
    set comments_count = greatest(comments_count - 1, 0)
    where id = old.post_id;
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_post_comments_set_updated_at on public.post_comments;
create trigger trg_post_comments_set_updated_at
before update on public.post_comments
for each row
execute function public.set_updated_at();

drop trigger if exists trg_post_comments_sync_count_insert on public.post_comments;
create trigger trg_post_comments_sync_count_insert
after insert on public.post_comments
for each row
execute function public.sync_post_comment_count();

drop trigger if exists trg_post_comments_sync_count_delete on public.post_comments;
create trigger trg_post_comments_sync_count_delete
after delete on public.post_comments
for each row
execute function public.sync_post_comment_count();

alter table public.post_comments enable row level security;

drop policy if exists "comments are viewable by everyone" on public.post_comments;
create policy "comments are viewable by everyone"
on public.post_comments
for select
to anon, authenticated
using (true);

drop policy if exists "authenticated users can create their own comments" on public.post_comments;
create policy "authenticated users can create their own comments"
on public.post_comments
for insert
to authenticated
with check (auth.uid() = author_id);

drop policy if exists "authenticated users can update their own comments" on public.post_comments;
create policy "authenticated users can update their own comments"
on public.post_comments
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "authenticated users can delete their own comments" on public.post_comments;
create policy "authenticated users can delete their own comments"
on public.post_comments
for delete
to authenticated
using (auth.uid() = author_id);
