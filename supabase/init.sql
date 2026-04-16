create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  username text not null unique,
  avatar_url text not null,
  bio text,
  post_count integer not null default 0 check (post_count >= 0),
  follower_count integer not null default 0 check (follower_count >= 0),
  following_count integer not null default 0 check (following_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(trim(content)) >= 3),
  image_url text,
  image_urls text[] not null default '{}',
  type text not null default 'standard' check (type in ('standard', 'quote', 'gallery')),
  visibility text not null default 'public' check (visibility in ('public', 'followers', 'private')),
  location text,
  tags text[] not null default '{}',
  likes_count integer not null default 0 check (likes_count >= 0),
  comments_count integer not null default 0 check (comments_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_profiles_username on public.profiles (username);
create index if not exists idx_posts_author_id on public.posts (author_id);
create index if not exists idx_posts_created_at_desc on public.posts (created_at desc);
create index if not exists idx_posts_visibility_created_at on public.posts (visibility, created_at desc);
create index if not exists idx_posts_tags_gin on public.posts using gin (tags);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_posts_set_updated_at on public.posts;
create trigger trg_posts_set_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

create or replace function public.sync_profile_post_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles
    set post_count = post_count + 1
    where id = new.author_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.profiles
    set post_count = greatest(post_count - 1, 0)
    where id = old.author_id;
    return old;
  end if;

  if tg_op = 'UPDATE' and new.author_id <> old.author_id then
    update public.profiles
    set post_count = greatest(post_count - 1, 0)
    where id = old.author_id;

    update public.profiles
    set post_count = post_count + 1
    where id = new.author_id;
  end if;

  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    name,
    username,
    avatar_url,
    bio
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', '@' || split_part(new.email, '@', 1)),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      'https://api.dicebear.com/9.x/notionists/svg?seed=' || new.id::text
    ),
    null
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_posts_sync_profile_post_count_insert on public.posts;
create trigger trg_posts_sync_profile_post_count_insert
after insert on public.posts
for each row
execute function public.sync_profile_post_count();

drop trigger if exists trg_posts_sync_profile_post_count_delete on public.posts;
create trigger trg_posts_sync_profile_post_count_delete
after delete on public.posts
for each row
execute function public.sync_profile_post_count();

drop trigger if exists trg_posts_sync_profile_post_count_update on public.posts;
create trigger trg_posts_sync_profile_post_count_update
after update of author_id on public.posts
for each row
execute function public.sync_profile_post_count();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;

drop policy if exists "profiles are viewable by everyone" on public.profiles;
create policy "profiles are viewable by everyone"
on public.profiles
for select
to anon, authenticated
using (true);

drop policy if exists "authenticated users can update their own profile" on public.profiles;
create policy "authenticated users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "posts are viewable by everyone when public" on public.posts;
create policy "posts are viewable by everyone when public"
on public.posts
for select
to anon, authenticated
using (visibility = 'public');

drop policy if exists "authenticated users can view follower posts" on public.posts;
create policy "authenticated users can view follower posts"
on public.posts
for select
to authenticated
using (visibility in ('public', 'followers'));

drop policy if exists "authenticated users can insert their own posts" on public.posts;
create policy "authenticated users can insert their own posts"
on public.posts
for insert
to authenticated
with check (auth.uid() = author_id);

drop policy if exists "authenticated users can update their own posts" on public.posts;
create policy "authenticated users can update their own posts"
on public.posts
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "authenticated users can delete their own posts" on public.posts;
create policy "authenticated users can delete their own posts"
on public.posts
for delete
to authenticated
using (auth.uid() = author_id);

insert into public.profiles (
  id,
  name,
  username,
  avatar_url,
  bio,
  follower_count,
  following_count
)
values (
  '11111111-1111-1111-1111-111111111111',
  '埃琳娜·罗德里格斯',
  '@elenar_designs',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  '数字艺术家与交互设计师，专注于流体运动、海洋色调与叙事型界面。',
  12400,
  892
)
on conflict (id) do update set
  name = excluded.name,
  username = excluded.username,
  avatar_url = excluded.avatar_url,
  bio = excluded.bio,
  follower_count = excluded.follower_count,
  following_count = excluded.following_count;

insert into public.posts (
  id,
  author_id,
  content,
  image_url,
  type,
  visibility,
  location,
  tags,
  likes_count,
  comments_count,
  created_at
)
values
  (
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    '在平凡中发现奇迹。夕阳洒在教堂上的那一刻，简直如梦似幻。',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    'standard',
    'public',
    'Lisbon',
    array['photography', 'sunset'],
    1200,
    48,
    timezone('utc', now()) - interval '2 hours'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    '创新不在于与众不同，而在于以最自然的方式改变生活。',
    null,
    'quote',
    'public',
    null,
    array['thinking', 'design'],
    842,
    12,
    timezone('utc', now()) - interval '5 hours'
  )
on conflict (id) do nothing;
