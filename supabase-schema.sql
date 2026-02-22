-- ============================================================
-- Hverdagshjelp.no — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Enable PostGIS extension
create extension if not exists postgis;

-- ============================================================
-- 2. Tables
-- ============================================================

-- Profiles: all users (seekers, helpers, admins)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'helper', 'admin')),
  name text not null,
  email text unique not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpers: extends profiles for helper-specific data
create table helpers (
  id uuid primary key references profiles(id) on delete cascade,
  description text,
  location_label text,
  location geography(point, 4326),
  availability jsonb default '{"timeOfDay":[],"daysOfWeek":[]}',
  review_count int not null default 0,
  tier text not null default 'free' check (tier in ('free', 'basic', 'premium')),
  verified boolean not null default false,
  active boolean not null default true,
  locked boolean not null default false,
  referred_by uuid references helpers(id),
  created_at timestamptz not null default now()
);

-- Categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text,
  description text,
  color text,
  sort_order int not null default 0
);

-- Helper services: normalized services per helper
create table helper_services (
  id uuid primary key default gen_random_uuid(),
  helper_id uuid not null references helpers(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  hourly_rate int,
  pricing_type text not null default 'hourly' check (pricing_type in ('hourly', 'agreement')),
  competence text,
  tags text[] default '{}',
  unique (helper_id, category_id)
);

-- Favorites: users can save helpers
create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  helper_id uuid not null references helpers(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, helper_id)
);

-- Reviews: users can leave feedback about helpers
create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  helper_id uuid not null references helpers(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (user_id, helper_id)
);

-- Subscriptions: tracks active Vipps recurring payments
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  helper_id uuid not null references helpers(id) on delete cascade unique,
  tier text not null check (tier in ('basic', 'premium')),
  vipps_agreement_id text,
  status text not null default 'pending' check (status in ('pending', 'active', 'stopped', 'expired')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Payments: payment history log
create table payments (
  id uuid primary key default gen_random_uuid(),
  helper_id uuid not null references helpers(id) on delete cascade,
  subscription_id uuid references subscriptions(id),
  amount_nok int not null,
  status text not null default 'pending' check (status in ('pending', 'charged', 'failed', 'refunded')),
  vipps_payment_id text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 3. Indexes
-- ============================================================

create index helpers_location_idx on helpers using gist (location);
create index helper_services_tags_idx on helper_services using gin (tags);
create index helpers_active_locked_idx on helpers (active, locked);
create index categories_slug_idx on categories (slug);
create index categories_sort_order_idx on categories (sort_order);
create index favorites_user_id_idx on favorites (user_id);
create index reviews_helper_id_idx on reviews (helper_id);
create index reviews_user_id_idx on reviews (user_id);
create index subscriptions_helper_id_idx on subscriptions (helper_id);
create index payments_helper_id_idx on payments (helper_id);

-- ============================================================
-- 4. Updated_at trigger for profiles
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- ============================================================
-- 5. Auto-create profile on signup trigger
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, role, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- 6. Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table helpers enable row level security;
alter table helper_services enable row level security;
alter table categories enable row level security;

-- Profiles RLS
create policy "Anyone can read profiles"
  on profiles for select using (true);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Admins can update any profile"
  on profiles for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Helpers RLS
create policy "Anyone can read active unlocked helpers"
  on helpers for select using (true);

create policy "Helpers can insert own record"
  on helpers for insert with check (auth.uid() = id);

create policy "Helpers can update own record"
  on helpers for update using (auth.uid() = id);

create policy "Admins can update any helper"
  on helpers for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Helper services RLS
create policy "Anyone can read helper services"
  on helper_services for select using (true);

create policy "Helpers can insert own services"
  on helper_services for insert with check (auth.uid() = helper_id);

create policy "Helpers can update own services"
  on helper_services for update using (auth.uid() = helper_id);

create policy "Helpers can delete own services"
  on helper_services for delete using (auth.uid() = helper_id);

-- Categories RLS
create policy "Anyone can read categories"
  on categories for select using (true);

create policy "Admins can insert categories"
  on categories for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update categories"
  on categories for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Subscriptions RLS
alter table subscriptions enable row level security;

create policy "Helpers can read own subscription"
  on subscriptions for select using (auth.uid() = helper_id);

create policy "Admins can read all subscriptions"
  on subscriptions for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can manage subscriptions"
  on subscriptions for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Payments RLS
alter table payments enable row level security;

create policy "Helpers can read own payments"
  on payments for select using (auth.uid() = helper_id);

create policy "Admins can read all payments"
  on payments for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Favorites RLS
alter table favorites enable row level security;

create policy "Users can read own favorites"
  on favorites for select using (auth.uid() = user_id);

create policy "Users can insert own favorites"
  on favorites for insert with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on favorites for delete using (auth.uid() = user_id);

-- Reviews RLS
alter table reviews enable row level security;

create policy "Anyone can read reviews"
  on reviews for select using (true);

create policy "Users can insert own reviews"
  on reviews for insert with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on reviews for update using (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on reviews for delete using (auth.uid() = user_id);

-- ============================================================
-- 6b. Auto-assign admin role for kimsandvold@gmail.com
-- ============================================================

create or replace function assign_admin_role()
returns trigger as $$
begin
  if new.email = 'kimsandvold@gmail.com' then
    update profiles set role = 'admin' where id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created_assign_admin
  after insert on profiles
  for each row execute function assign_admin_role();

-- ============================================================
-- 6c. Update helper review_count when reviews change
-- ============================================================

create or replace function update_review_count()
returns trigger as $$
declare
  target_helper_id uuid;
begin
  target_helper_id := coalesce(new.helper_id, old.helper_id);
  update helpers
  set review_count = (select count(*) from reviews where helper_id = target_helper_id)
  where id = target_helper_id;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger reviews_count_trigger
  after insert or update or delete on reviews
  for each row execute function update_review_count();

-- ============================================================
-- 7. Storage bucket for avatars
-- ============================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Anyone can read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- 8. Search helpers RPC function
-- ============================================================

create or replace function search_helpers(
  search_query text default null,
  category_slug text default null,
  user_lat double precision default null,
  user_lng double precision default null,
  radius_km double precision default null,
  page_offset int default 0,
  page_limit int default 20
)
returns table (
  id uuid,
  name text,
  email text,
  phone text,
  avatar_url text,
  description text,
  location_label text,
  lat double precision,
  lng double precision,
  availability jsonb,
  review_count int,
  tier text,
  verified boolean,
  active boolean,
  referred_by uuid,
  created_at timestamptz,
  services jsonb,
  distance_km double precision,
  avg_rating numeric
)
language plpgsql stable
as $$
begin
  return query
  select
    h.id,
    p.name,
    p.email,
    p.phone,
    p.avatar_url,
    h.description,
    h.location_label,
    st_y(h.location::geometry) as lat,
    st_x(h.location::geometry) as lng,
    h.availability,
    h.review_count,
    h.tier,
    h.verified,
    h.active,
    h.referred_by,
    h.created_at,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', hs.id,
            'category', c.slug,
            'categoryName', c.name,
            'categoryIcon', c.icon,
            'hourlyRate', hs.hourly_rate,
            'pricingType', hs.pricing_type,
            'competence', hs.competence,
            'tags', hs.tags
          )
        )
        from helper_services hs
        join categories c on c.id = hs.category_id
        where hs.helper_id = h.id
      ),
      '[]'::jsonb
    ) as services,
    case
      when user_lat is not null and user_lng is not null and h.location is not null
      then st_distance(
        h.location,
        st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography
      ) / 1000.0
      else null
    end as distance_km,
    (select round(avg(r.rating)::numeric, 1) from reviews r where r.helper_id = h.id) as avg_rating
  from helpers h
  join profiles p on p.id = h.id
  where h.active = true
    and h.locked = false
    -- Geo filter
    and (
      user_lat is null or user_lng is null or radius_km is null
      or st_dwithin(
        h.location,
        st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography,
        radius_km * 1000
      )
    )
    -- Category filter
    and (
      category_slug is null
      or exists (
        select 1
        from helper_services hs2
        join categories c2 on c2.id = hs2.category_id
        where hs2.helper_id = h.id and c2.slug = category_slug
      )
    )
    -- Text search (name, description, location, category names, competence, tags)
    and (
      search_query is null
      or p.name ilike '%' || search_query || '%'
      or h.description ilike '%' || search_query || '%'
      or h.location_label ilike '%' || search_query || '%'
      or exists (
        select 1
        from helper_services hs3
        join categories c3 on c3.id = hs3.category_id
        where hs3.helper_id = h.id
          and (
            c3.name ilike '%' || search_query || '%'
            or hs3.competence ilike '%' || search_query || '%'
            or exists (
              select 1 from unnest(hs3.tags) as t where t ilike '%' || search_query || '%'
            )
          )
      )
    )
  order by
    case h.tier when 'premium' then 0 when 'basic' then 1 else 2 end,
    case
      when user_lat is not null and user_lng is not null and h.location is not null
      then st_distance(
        h.location,
        st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography
      )
      else 0
    end,
    h.review_count desc
  offset page_offset
  limit page_limit;
end;
$$;

-- ============================================================
-- 9. Admin stats RPC
-- ============================================================

create or replace function get_admin_stats()
returns jsonb
language plpgsql stable
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'total', (select count(*) from helpers),
    'active', (select count(*) from helpers where active = true),
    'verified', (select count(*) from helpers where verified = true),
    'byCategory', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', c.id,
            'slug', c.slug,
            'name', c.name,
            'icon', c.icon,
            'description', c.description,
            'count', (
              select count(distinct hs.helper_id)
              from helper_services hs
              where hs.category_id = c.id
            )
          )
          order by c.sort_order
        )
        from categories c
      ),
      '[]'::jsonb
    ),
    'byTier', (
      select jsonb_agg(
        jsonb_build_object('tier', t.tier, 'count', t.cnt)
      )
      from (
        select tier, count(*) as cnt
        from helpers
        group by tier
        order by case tier when 'free' then 0 when 'basic' then 1 else 2 end
      ) t
    )
  ) into result;
  return result;
end;
$$;

-- ============================================================
-- 10. Seed categories
-- ============================================================

insert into categories (slug, name, icon, description, color, sort_order) values
  ('rengjoring', 'Rengjøring', null, 'Profesjonell rengjøring av hjem og kontor', null, 1),
  ('snorydding', 'Snørydding', null, 'Snørydding av innkjørsler, tak og gangveier', null, 2),
  ('hagearbeid', 'Hagearbeid', null, 'Gressklipping, hekklipping og hagevedlikehold', null, 3),
  ('smajobber', 'Småjobber', null, 'Montering, flytting og diverse oppgaver', null, 4),
  ('handlehjelp', 'Handlehjelp', null, 'Hjelp med dagligvarehandel og ærend', null, 5),
  ('flytting', 'Flytting', null, 'Flyttehjelp og transport av møbler', null, 6),
  ('vaktmester', 'Vaktmester', null, 'Vedlikehold og reparasjoner i hjemmet', null, 7),
  ('hundelufting', 'Hundelufting', null, 'Lufting og pass av kjæledyr', null, 8),
  ('besoksvenn', 'Besøksvenn', null, 'Selskap, samtale og sosial støtte', null, 9),
  ('transport', 'Transport', null, 'Kjøring til avtaler, handling og ærend', null, 10),
  ('pc-hjelp', 'PC-hjelp', null, 'Hjelp med datamaskin, nettbrett og mobil', null, 11),
  ('kurs-opplaring', 'Kurs/opplæring', null, 'Undervisning, kurs og personlig opplæring', null, 12),
  ('turfolge', 'Turfølge', null, 'Følge på tur, gåtur eller aktivitet', null, 13),
  ('sjafor', 'Sjåfør', null, 'Kjøring til lege, butikk eller andre ærend', null, 14),
  ('barnepass', 'Barnepass', null, 'Barnevakt, henting fra skole og aktiviteter', null, 15),
  ('rydding', 'Rydding', null, 'Rydding, sortering og organisering av hjem', null, 16)
on conflict (slug) do nothing;

-- ============================================================
-- 11. Profile views (for "Se hvem som har sett profilen din")
-- ============================================================

create table profile_views (
  id uuid primary key default gen_random_uuid(),
  helper_id uuid not null references helpers(id) on delete cascade,
  viewer_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index profile_views_helper_idx on profile_views (helper_id);

alter table profile_views enable row level security;

create policy "Anyone can insert views"
  on profile_views for insert with check (true);

create policy "Helpers can read own views"
  on profile_views for select using (helper_id = auth.uid());

-- ============================================================
-- 12. Category helper counts RPC
-- ============================================================

create or replace function get_category_helper_counts()
returns table (slug text, helper_count bigint)
language sql stable
as $$
  select c.slug, count(distinct hs.helper_id)
  from helper_services hs
  join categories c on c.id = hs.category_id
  join helpers h on h.id = hs.helper_id
  where h.active = true and h.locked = false
  group by c.slug;
$$;

-- ============================================================
-- 13. Conversations & Messages (In-App Messaging)
-- ============================================================

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

-- ============================================================
-- 14. Bookings (Scheduling Requests)
-- ============================================================

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
  seen_by_client boolean not null default false,
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

-- ============================================================
-- 15. Ads
-- ============================================================

create table ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  href text not null,
  image_url text,
  cta text not null default 'Les mer',
  bg_color text not null default '#1a1a2e',
  text_color text not null default '#ffffff',
  accent_color text not null default '#3b82f6',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table ads enable row level security;

create policy "Anyone can read active ads"
  on ads for select using (active = true);

create policy "Admins can select ads"
  on ads for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can insert ads"
  on ads for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update ads"
  on ads for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete ads"
  on ads for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Seed the existing Minio ad
insert into ads (title, description, href, image_url, cta, bg_color, text_color, accent_color)
values (
  'Minio',
  'Skreddersydd i tre, etter dine mål. Søppelskjul, vedskjul og uteprodukter bygget for å vare.',
  'https://minio.no',
  'https://minio.no/images/products/garbage_house_4.webp',
  'Besøk minio.no',
  '#2c1810',
  '#ffffff',
  '#f59e0b'
);

-- ============================================================
-- 16. Enforce category limits server-side
-- ============================================================

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
