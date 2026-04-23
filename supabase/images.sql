create table if not exists public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  storage_path text,
  public_url text not null,
  width integer,
  height integer,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_post_images_post_id_sort_order on public.post_images (post_id, sort_order asc);
create index if not exists idx_post_images_cover on public.post_images (post_id, is_cover);

alter table public.post_images enable row level security;

drop policy if exists "post images are viewable by everyone" on public.post_images;
create policy "post images are viewable by everyone"
on public.post_images
for select
to anon, authenticated
using (true);

drop policy if exists "authenticated users can insert images for their own posts" on public.post_images;
create policy "authenticated users can insert images for their own posts"
on public.post_images
for insert
to authenticated
with check (
  exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id
      and posts.author_id = auth.uid()
  )
);

drop policy if exists "authenticated users can update images for their own posts" on public.post_images;
create policy "authenticated users can update images for their own posts"
on public.post_images
for update
to authenticated
using (
  exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id
      and posts.author_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id
      and posts.author_id = auth.uid()
  )
);

drop policy if exists "authenticated users can delete images for their own posts" on public.post_images;
create policy "authenticated users can delete images for their own posts"
on public.post_images
for delete
to authenticated
using (
  exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id
      and posts.author_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can read post images bucket" on storage.objects;
create policy "public can read post images bucket"
on storage.objects
for select
to public
using (bucket_id = 'post-images');

drop policy if exists "authenticated can upload post images" on storage.objects;
create policy "authenticated can upload post images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'post-images');

drop policy if exists "authenticated can update post images" on storage.objects;
create policy "authenticated can update post images"
on storage.objects
for update
to authenticated
using (bucket_id = 'post-images')
with check (bucket_id = 'post-images');

drop policy if exists "authenticated can delete post images" on storage.objects;
create policy "authenticated can delete post images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'post-images');
