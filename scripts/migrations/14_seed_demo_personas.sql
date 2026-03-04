-- ═══════════════════════════════════════════════════════════
-- 09: SEED DEMO PERSONAS
-- Creates 3 real login accounts for demo/testing purposes.
-- ⚠️ Run this ONCE. Accounts persist between reseeds.
-- ═══════════════════════════════════════════════════════════
-- DEMO CREDENTIALS (shared password for all 3):
--   Password: Demo2026!
--
-- ACCOUNTS:
--   lead@tdk.com             → Lead (give to client/proctors)
--   interviewer@tdk.com      → Interviewer (use for demo)
--   employee@tdk.com         → Employee (use for demo)
-- ═══════════════════════════════════════════════════════════

DO $$
DECLARE
    michael_id UUID;
    william_id UUID;
    james_id   UUID;
    hashed_pw  TEXT;
BEGIN
    hashed_pw := crypt('Demo2026!', gen_salt('bf', 10));

    -- ── Create James (Interviewer) if not exists ──
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'interviewer@tdk.com') THEN
        james_id := gen_random_uuid();
        INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (james_id, 'authenticated', 'authenticated', 'interviewer@tdk.com', hashed_pw, NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"James Smythe"}'::jsonb, NOW(), NOW());
        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
        VALUES (gen_random_uuid(), james_id, jsonb_build_object('sub', james_id::text, 'email', 'interviewer@tdk.com'), 'email', james_id::text, NOW(), NOW(), NOW());
    END IF;
    SELECT id INTO james_id FROM auth.users WHERE email = 'interviewer@tdk.com';

    -- ── Create William (Lead) if not exists ──
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'lead@tdk.com') THEN
        william_id := gen_random_uuid();
        INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (william_id, 'authenticated', 'authenticated', 'lead@tdk.com', hashed_pw, NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"William Willings"}'::jsonb, NOW(), NOW());
        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
        VALUES (gen_random_uuid(), william_id, jsonb_build_object('sub', william_id::text, 'email', 'lead@tdk.com'), 'email', william_id::text, NOW(), NOW(), NOW());
    END IF;
    SELECT id INTO william_id FROM auth.users WHERE email = 'lead@tdk.com';

    -- ── Create Michael (Employee) if not exists ──
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'employee@tdk.com') THEN
        michael_id := gen_random_uuid();
        INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (michael_id, 'authenticated', 'authenticated', 'employee@tdk.com', hashed_pw, NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Michael Johnsford"}'::jsonb, NOW(), NOW());
        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
        VALUES (gen_random_uuid(), michael_id, jsonb_build_object('sub', michael_id::text, 'email', 'employee@tdk.com'), 'email', michael_id::text, NOW(), NOW(), NOW());
    END IF;
    SELECT id INTO michael_id FROM auth.users WHERE email = 'employee@tdk.com';

    -- ── Upsert profiles ──
    INSERT INTO public.profiles (id, email, role, status, full_name)
    VALUES
        (james_id,   'interviewer@tdk.com', 'interviewer', 'active', 'James Smythe'),
        (william_id, 'lead@tdk.com',        'lead',        'active', 'William Willings'),
        (michael_id, 'employee@tdk.com',    'employee',    'active', 'Michael Johnsford')
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role, status = EXCLUDED.status, full_name = EXCLUDED.full_name;

    -- ── Upsert company_directory ──
    INSERT INTO public.company_directory (control_number, full_name, email, business_unit, department, intermediate_supervisor, position, date_hired, is_active)
    VALUES
        ('DEMO-001', 'William Willings',  'lead@tdk.com',        'BU2', 'HRD', NULL,               'Lead Manager',      '2020-01-15', true),
        ('DEMO-002', 'James Smythe',      'interviewer@tdk.com', 'BU2', 'HRD', 'William Willings', 'HR Interviewer',    '2021-06-01', true),
        ('DEMO-003', 'Michael Johnsford', 'employee@tdk.com',    'BU2', 'HRD', 'William Willings', 'HR Representative', '2022-03-15', true)
    ON CONFLICT (control_number) DO UPDATE SET email = EXCLUDED.email, intermediate_supervisor = EXCLUDED.intermediate_supervisor, position = EXCLUDED.position, full_name = EXCLUDED.full_name;

    -- ── Patch JWT role claim in user_metadata (CRITICAL for RLS) ──
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', p.role)
    FROM public.profiles p
    WHERE auth.users.id = p.id
    AND p.email IN ('lead@tdk.com', 'interviewer@tdk.com', 'employee@tdk.com');

    RAISE NOTICE 'Demo personas ready. William=%, James=%, Michael=%', william_id, james_id, michael_id;
END $$;

-- Verify — role must appear in raw_user_meta_data
SELECT u.email, u.raw_user_meta_data ->> 'role' AS jwt_role, p.role AS profile_role
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE u.email IN ('lead@tdk.com', 'interviewer@tdk.com', 'employee@tdk.com');
