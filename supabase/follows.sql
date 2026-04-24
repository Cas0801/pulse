create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint follows_unique_pair unique (follower_id, following_id),
  constraint follows_no_self check (follower_id <> following_id)
);

create index if not exists follows_follower_idx on public.follows (follower_id, created_at desc);
create index if not exists follows_following_idx on public.follows (following_id, created_at desc);

create or replace function public.sync_follow_counts()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles
    set following_count = following_count + 1
    where id = new.follower_id;

    update public.profiles
    set follower_count = follower_count + 1
    where id = new.following_id;

    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.profiles
    set following_count = greatest(following_count - 1, 0)
    where id = old.follower_id;

    update public.profiles
    set follower_count = greatest(follower_count - 1, 0)
    where id = old.following_id;

    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists follows_sync_counts on public.follows;
create trigger follows_sync_counts
after insert or delete on public.follows
for each row
execute function public.sync_follow_counts();

alter table public.follows enable row level security;

drop policy if exists "follows are readable" on public.follows;
create policy "follows are readable"
on public.follows
for select
using (true);

drop policy if exists "users can follow with own id" on public.follows;
create policy "users can follow with own id"
on public.follows
for insert
to authenticated
with check (auth.uid() = follower_id);

drop policy if exists "users can unfollow with own id" on public.follows;
create policy "users can unfollow with own id"
on public.follows
for delete
to authenticated
using (auth.uid() = follower_id);
