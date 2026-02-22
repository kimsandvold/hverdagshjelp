-- ============================================================
-- Migration: Conversations, Messages, Bookings, Category Limits
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Conversations & Messages (In-App Messaging)

create table conversations (
  id uuid primary key default gen_random_uuid(),
  participant_1 uuid not null references profiles(id) on delete cascade,
  participant_2 uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index messages_conversation_created_idx on messages (conversation_id, created_at);

create trigger conversations_updated_at
  before update on conversations
  for each row execute function update_updated_at();

-- Conversations RLS
alter table conversations enable row level security;

create policy "Participants can read own conversations"
  on conversations for select using (
    auth.uid() = participant_1 or auth.uid() = participant_2
  );

create policy "Authenticated users can create conversations"
  on conversations for insert with check (
    auth.uid() = participant_1 or auth.uid() = participant_2
  );

-- Messages RLS
alter table messages enable row level security;

create policy "Participants can read messages in their conversations"
  on messages for select using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
  );

create policy "Participants can insert messages in their conversations"
  on messages for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
  );

create policy "Participants can update messages (mark read)"
  on messages for update using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
  );

-- Get conversations RPC
create or replace function get_conversations(p_user_id uuid)
returns table (
  id uuid,
  other_user_id uuid,
  other_user_name text,
  other_user_avatar text,
  last_message text,
  last_message_at timestamptz,
  unread_count bigint
)
language plpgsql stable
as $$
begin
  return query
  select
    c.id,
    case when c.participant_1 = p_user_id then c.participant_2 else c.participant_1 end as other_user_id,
    p.name as other_user_name,
    p.avatar_url as other_user_avatar,
    lm.content as last_message,
    lm.created_at as last_message_at,
    (
      select count(*)
      from messages m2
      where m2.conversation_id = c.id
        and m2.sender_id != p_user_id
        and m2.read_at is null
    ) as unread_count
  from conversations c
  join profiles p on p.id = (
    case when c.participant_1 = p_user_id then c.participant_2 else c.participant_1 end
  )
  left join lateral (
    select m.content, m.created_at
    from messages m
    where m.conversation_id = c.id
    order by m.created_at desc
    limit 1
  ) lm on true
  where c.participant_1 = p_user_id or c.participant_2 = p_user_id
  order by coalesce(lm.created_at, c.created_at) desc;
end;
$$;

-- 2. Bookings (Scheduling Requests)

create table bookings (
  id uuid primary key default gen_random_uuid(),
  helper_id uuid not null references helpers(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  category_slug text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  description text not null,
  preferred_date text,
  agreed_price_nok int,
  platform_fee_nok int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_helper_id_idx on bookings (helper_id);
create index bookings_client_id_idx on bookings (client_id);

create trigger bookings_updated_at
  before update on bookings
  for each row execute function update_updated_at();

-- Bookings RLS
alter table bookings enable row level security;

create policy "Clients can read own bookings"
  on bookings for select using (auth.uid() = client_id);

create policy "Helpers can read their incoming bookings"
  on bookings for select using (auth.uid() = helper_id);

create policy "Clients can create bookings"
  on bookings for insert with check (auth.uid() = client_id);

create policy "Helpers can update their incoming bookings"
  on bookings for update using (auth.uid() = helper_id);

-- 3. Enforce category limits server-side

create or replace function check_service_category_limit()
returns trigger as $$
declare
  current_count int;
  helper_tier text;
begin
  select count(*) into current_count
  from helper_services
  where helper_id = new.helper_id;

  select tier into helper_tier
  from helpers
  where id = new.helper_id;

  if helper_tier = 'free' and current_count >= 2 then
    raise exception 'Gratis-brukere kan maks ha 2 tjenester. Oppgrader for å legge til flere.';
  end if;

  if helper_tier = 'basic' and current_count >= 5 then
    raise exception 'Basis-brukere kan maks ha 5 tjenester. Oppgrader til Premium for ubegrenset.';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger check_service_limit
  before insert on helper_services
  for each row execute function check_service_category_limit();
