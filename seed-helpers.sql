-- ============================================================
-- Seed 50 dummy helpers for hverdagshjelp.no
-- Run in Supabase SQL Editor
-- ============================================================

-- Clean up previous seed data (emails ending in @example.com)
DELETE FROM helper_services WHERE helper_id IN (SELECT id FROM profiles WHERE email LIKE '%@example.com');
DELETE FROM helpers WHERE id IN (SELECT id FROM profiles WHERE email LIKE '%@example.com');
DELETE FROM profiles WHERE email LIKE '%@example.com';
DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@example.com');
DELETE FROM auth.users WHERE email LIKE '%@example.com';

-- Create fake auth users + profiles + helpers + services
-- Uses gen_random_uuid() for IDs

DO $$
DECLARE
  helper_ids uuid[] := ARRAY[]::uuid[];
  cat_ids record;
  h_id uuid;
  i int;

  -- Norwegian names
  first_names text[] := ARRAY[
    'Erik','Nora','Lars','Ingrid','Magnus','Sofie','Olav','Emilie','Henrik','Maja',
    'Anders','Kari','Simen','Thea','Jonas','Hanna','Kristian','Ida','Thomas','Sara',
    'Morten','Camilla','Stian','Julie','Petter','Marte','Andreas','Linnea','Tobias','Elise',
    'Håkon','Astrid','Vegard','Vilde','Fredrik','Silje','Eirik','Tuva','Trond','Amalie',
    'Geir','Maria','Sindre','Karoline','Joakim','Live','Espen','Hedda','Bjørn','Solveig'
  ];

  last_names text[] := ARRAY[
    'Hansen','Johansen','Olsen','Larsen','Andersen','Pedersen','Nilsen','Kristiansen',
    'Jensen','Karlsen','Johnsen','Pettersen','Eriksen','Berg','Haugen','Hagen',
    'Johannessen','Andreassen','Jacobsen','Dahl','Jørgensen','Henriksen','Lund','Halvorsen',
    'Sørensen','Jakobsen','Moen','Gundersen','Iversen','Strand','Solberg','Svendsen',
    'Erickson','Bakke','Berge','Holm','Lien','Brekke','Vik','Nygård',
    'Aas','Myhre','Tangen','Sæther','Dale','Hauge','Ruud','Bøe',
    'Sandvik','Lunde'
  ];

  -- Norwegian cities with coordinates (lng, lat)
  cities text[] := ARRAY[
    'Oslo','Bergen','Trondheim','Stavanger','Drammen','Fredrikstad','Kristiansand',
    'Tromsø','Sandnes','Sarpsborg','Skien','Ålesund','Sandefjord','Haugesund',
    'Tønsberg','Moss','Porsgrunn','Bodø','Arendal','Hamar','Larvik','Halden',
    'Lillehammer','Molde','Harstad','Gjøvik','Narvik','Steinkjer','Kongsberg','Elverum'
  ];
  city_lngs double precision[] := ARRAY[
    10.75,5.33,10.40,5.73,10.20,10.93,8.00,
    18.96,5.74,11.11,9.61,6.15,10.22,5.27,
    10.41,10.67,9.66,14.40,8.77,11.07,10.03,11.39,
    10.47,7.16,16.54,10.69,17.43,11.50,9.65,11.56
  ];
  city_lats double precision[] := ARRAY[
    59.91,60.39,63.43,58.97,59.74,59.22,58.15,
    69.65,58.85,59.28,59.21,62.47,59.13,59.41,
    59.27,59.43,59.14,67.28,58.46,60.79,59.05,59.12,
    61.12,62.74,68.80,60.80,68.43,64.01,59.67,60.88
  ];

  -- Descriptions
  descs text[] := ARRAY[
    'Erfaren og pålitelig hjelper med lang erfaring innen hjemmetjenester. Stiller alltid opp med godt humør!',
    'Fleksibel og grundig. Har jobbet med ulike typer oppdrag og tilpasser meg kundens behov.',
    'Liker å hjelpe folk i hverdagen. Har bakgrunn fra servicebransjen og er vant til å jobbe selvstendig.',
    'Aktiv og serviceinnstilt person som setter kundetilfredshet først. Referanser kan oppgis.',
    'Dedikert hjelper med fokus på kvalitet. Tar gjerne på meg både store og små oppgaver.',
    'Har mange års erfaring med praktisk arbeid. Punktlig, ordentlig og til å stole på.',
    'Student som tilbyr rimelig hjelp i nærområdet. Fleksibel med tidspunkter og alltid blid!',
    'Pensjonist med masse erfaring og god tid. Hjelper gjerne til med alt fra hage til data.',
    'Profesjonell og effektiv. Driver eget enkeltpersonforetak innen hjemmetjenester.',
    'Allsidig hjelper som kan det meste. Fra rengjøring til montering — jeg fikser det!'
  ];

  -- Availability options (as jsonb arrays to avoid jagged array issue)
  time_opts jsonb[] := ARRAY[
    '["dag"]'::jsonb,
    '["dag","kveld"]'::jsonb,
    '["kveld"]'::jsonb,
    '["dag","kveld","natt"]'::jsonb,
    '["dag","natt"]'::jsonb
  ];
  day_opts jsonb[] := ARRAY[
    '["hverdager"]'::jsonb,
    '["hverdager","helg"]'::jsonb,
    '["helg"]'::jsonb,
    '["hverdager","helg"]'::jsonb
  ];

  tiers text[] := ARRAY['free','free','free','basic','basic','premium'];

  v_name text;
  v_email text;
  v_phone text;
  v_city_idx int;
  v_desc text;
  v_tier text;
  v_time jsonb;
  v_days jsonb;

  v_verified boolean;

BEGIN
  -- Gather category IDs
  -- We'll assign services after creating helpers

  FOR i IN 1..50 LOOP
    h_id := gen_random_uuid();
    helper_ids := array_append(helper_ids, h_id);

    v_name := first_names[i] || ' ' || last_names[i];
    v_email := lower(first_names[i]) || '.' || lower(last_names[i]) || '@example.com';
    v_phone := '+47 ' || (40000000 + floor(random() * 59999999)::int)::text;
    v_city_idx := (i % 30) + 1;
    v_desc := descs[(i % 10) + 1];
    v_tier := tiers[(i % 6) + 1];
    v_time := time_opts[(i % 5) + 1];
    v_days := day_opts[(i % 4) + 1];
    v_verified := (i % 3 = 0);

    -- Create auth user (using raw insert into auth.users for seeding)
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      h_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_email,
      crypt('DummyPass123!', gen_salt('bf')),
      now(),
      now(),
      now(),
      encode(gen_random_bytes(16), 'hex'),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('name', v_name, 'role', 'helper')
    );

    -- Create identity for the user
    INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      h_id::text,
      h_id,
      jsonb_build_object('sub', h_id::text, 'email', v_email),
      'email',
      now(),
      now(),
      now()
    );

    -- Update profile created by trigger (add phone)
    UPDATE profiles SET phone = v_phone WHERE id = h_id;

    -- Helper
    INSERT INTO helpers (id, description, location_label, location, availability, tier, verified, active)
    VALUES (
      h_id,
      v_desc,
      cities[v_city_idx],
      ST_SetSRID(ST_MakePoint(
        city_lngs[v_city_idx] + (random() - 0.5) * 0.1,
        city_lats[v_city_idx] + (random() - 0.5) * 0.05
      ), 4326)::geography,
      jsonb_build_object('timeOfDay', v_time, 'daysOfWeek', v_days),
      v_tier,
      v_verified,
      true
    );
  END LOOP;

  -- Assign 1-4 random services to each helper
  FOR i IN 1..50 LOOP
    INSERT INTO helper_services (helper_id, category_id, hourly_rate, pricing_type, tags)
    SELECT
      helper_ids[i],
      c.id,
      CASE WHEN random() < 0.15 THEN null ELSE (150 + floor(random() * 350)::int) END,
      CASE WHEN random() < 0.15 THEN 'agreement' ELSE 'hourly' END,
      CASE floor(random() * 6)::int
        WHEN 0 THEN ARRAY['erfaren','grundig']
        WHEN 1 THEN ARRAY['fleksibel','rask']
        WHEN 2 THEN ARRAY['pålitelig']
        WHEN 3 THEN ARRAY['rimelig','studentpris']
        WHEN 4 THEN ARRAY['profesjonell','referanser']
        ELSE ARRAY['punktlig','effektiv']
      END
    FROM (
      SELECT id FROM categories ORDER BY random() LIMIT (1 + floor(random() * 4)::int)
    ) c;
  END LOOP;

  RAISE NOTICE 'Created 50 dummy helpers with services!';
END $$;
