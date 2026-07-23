create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null check (char_length(content) between 1 and 20000),
  model text,
  token_count integer,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_usage_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default (timezone('utc', now()))::date,
  request_count integer not null default 0 check (request_count between 0 and 20),
  primary key (user_id, usage_date)
);

create index if not exists ai_conversations_user_updated_idx on public.ai_conversations(user_id, updated_at desc);
create index if not exists ai_messages_conversation_created_idx on public.ai_messages(conversation_id, created_at desc);
create index if not exists ai_messages_user_created_idx on public.ai_messages(user_id, created_at desc);

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_usage_daily enable row level security;

drop policy if exists "ai conversations owner select" on public.ai_conversations;
create policy "ai conversations owner select" on public.ai_conversations for select using (user_id = auth.uid());
drop policy if exists "ai conversations owner insert" on public.ai_conversations;
create policy "ai conversations owner insert" on public.ai_conversations for insert with check (user_id = auth.uid());
drop policy if exists "ai conversations owner update" on public.ai_conversations;
create policy "ai conversations owner update" on public.ai_conversations for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "ai conversations owner delete" on public.ai_conversations;
create policy "ai conversations owner delete" on public.ai_conversations for delete using (user_id = auth.uid());

drop policy if exists "ai messages owner select" on public.ai_messages;
create policy "ai messages owner select" on public.ai_messages for select using (user_id = auth.uid());
drop policy if exists "ai messages owner insert" on public.ai_messages;
create policy "ai messages owner insert" on public.ai_messages for insert with check (
  user_id = auth.uid() and exists (
    select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = auth.uid()
  )
);
drop policy if exists "ai messages owner delete" on public.ai_messages;
create policy "ai messages owner delete" on public.ai_messages for delete using (user_id = auth.uid());

create or replace function public.consume_ai_quota(p_user_id uuid, p_limit integer default 20)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare accepted boolean;
begin
  if auth.uid() is null or auth.uid() <> p_user_id or p_limit < 1 then return false; end if;
  insert into public.ai_usage_daily(user_id, usage_date, request_count)
  values (p_user_id, (timezone('utc', now()))::date, 1)
  on conflict (user_id, usage_date)
  do update set request_count = public.ai_usage_daily.request_count + 1
  where public.ai_usage_daily.request_count < p_limit
  returning true into accepted;
  return coalesce(accepted, false);
end;
$$;

revoke all on function public.consume_ai_quota(uuid, integer) from public;
grant execute on function public.consume_ai_quota(uuid, integer) to authenticated;
