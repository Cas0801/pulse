create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (post_id, user_id)
);

create table if not exists public.post_bookmarks (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (post_id, user_id)
);

create index if not exists idx_post_likes_user_id on public.post_likes (user_id);
create index if not exists idx_post_bookmarks_user_id on public.post_bookmarks (user_id);

create or replace function public.sync_post_like_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts
    set likes_count = likes_count + 1
    where id = new.post_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.posts
    set likes_count = greatest(likes_count - 1, 0)
    where id = old.post_id;
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_post_likes_sync_count_insert on public.post_likes;
create trigger trg_post_likes_sync_count_insert
after insert on public.post_likes
for each row
execute function public.sync_post_like_count();

drop trigger if exists trg_post_likes_sync_count_delete on public.post_likes;
create trigger trg_post_likes_sync_count_delete
after delete on public.post_likes
for each row
execute function public.sync_post_like_count();

alter table public.post_likes enable row level security;
alter table public.post_bookmarks enable row level security;

drop policy if exists "authenticated users can view their own likes" on public.post_likes;
create policy "authenticated users can view their own likes"
on public.post_likes
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "authenticated users can like posts as themselves" on public.post_likes;
create policy "authenticated users can like posts as themselves"
on public.post_likes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "authenticated users can remove their own likes" on public.post_likes;
create policy "authenticated users can remove their own likes"
on public.post_likes
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "authenticated users can view their own bookmarks" on public.post_bookmarks;
create policy "authenticated users can view their own bookmarks"
on public.post_bookmarks
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "authenticated users can create their own bookmarks" on public.post_bookmarks;
create policy "authenticated users can create their own bookmarks"
on public.post_bookmarks
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "authenticated users can delete their own bookmarks" on public.post_bookmarks;
create policy "authenticated users can delete their own bookmarks"
on public.post_bookmarks
for delete
to authenticated
using (auth.uid() = user_id);
