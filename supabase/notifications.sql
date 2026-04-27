create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('post_like', 'post_comment', 'profile_follow')),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  post_preview text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists notifications_recipient_created_idx
on public.notifications (recipient_id, created_at desc);

create index if not exists notifications_recipient_unread_idx
on public.notifications (recipient_id, is_read, created_at desc);

create index if not exists notifications_actor_created_idx
on public.notifications (actor_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "recipients can read own notifications" on public.notifications;
create policy "recipients can read own notifications"
on public.notifications
for select
to authenticated
using (auth.uid() = recipient_id);

drop policy if exists "system can create notifications" on public.notifications;
create policy "system can create notifications"
on public.notifications
for insert
to authenticated
with check (auth.uid() = actor_id);

drop policy if exists "recipients can update own notifications" on public.notifications;
create policy "recipients can update own notifications"
on public.notifications
for update
to authenticated
using (auth.uid() = recipient_id)
with check (auth.uid() = recipient_id);
