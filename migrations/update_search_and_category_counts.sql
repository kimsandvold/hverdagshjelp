-- Migration: Update search_helpers + add get_category_helper_counts
-- Run this in Supabase SQL Editor

-- 1. Update search_helpers to also search category names and competence
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

-- 2. Add category helper counts function
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
