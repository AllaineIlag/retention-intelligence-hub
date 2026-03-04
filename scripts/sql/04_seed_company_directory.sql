-- ══════════════════════════════════════════════════════════════════
-- 04: SEED COMPANY DIRECTORY (Mock Employees)
-- ══════════════════════════════════════════════════════════════════
-- PURPOSE : Populates company_directory with randomized mock staff.
-- SAFE    : Never touches REAL-001..004 (the 4 real demo accounts).
-- RERUN   : Safe to re-run. Uses ON CONFLICT DO NOTHING.
-- ══════════════════════════════════════════════════════════════════

DO $$
DECLARE
    -- ┌──────────────────────────────────────────────────────────────┐
    -- │                  ⚙  CONFIGURATION SECTION                    │
    -- │            Edit THESE values directly in the DECLARE block.  │
    -- ├──────────────────────────────────────────────────────────────┤
    -- │  How many profiles (resigned employees) you plan to seed      │
    -- │  in 05_seed_resignations.sql.                                │
    -- └──────────────────────────────────────────────────────────────┘
    profiles_to_seed INT  := 1200;  -- To support 1200 resignations (5000 * 2% * 12 months)
    hire_year_min    INT  := 2015;  -- Date hired range min
    hire_year_max    INT  := 2025;  -- Date hired range max

    -- ── Derived from config (do not edit below) ──
    total_employees  INT  := 5000;

    -- ── Ref table ID arrays (loaded from DB) ──
    dept_ids    UUID[];
    pos_ids     UUID[];
    sup_ids     UUID[];
    bu_names    TEXT[] := ARRAY['BU1','BU2','BU3','BU4','BU5'];

    -- ── Name pools ──
    first_names TEXT[] := ARRAY[
        'James','John','Robert','Michael','William','David','Richard','Joseph',
        'Thomas','Charles','Mary','Patricia','Jennifer','Linda','Barbara',
        'Elizabeth','Susan','Jessica','Sarah','Karen','Emily','Lisa','Nancy',
        'Sandra','Ashley','Dorothy','Kimberly','Margaret','Amanda','Melissa',
        'Andrew','Brian','Daniel','George','Joshua','Kenneth','Kevin','Mark',
        'Matthew','Christopher','Anthony','Jason','Justin','Brandon','Ryan'
    ];
    last_names  TEXT[] := ARRAY[
        'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis',
        'Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson',
        'Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson',
        'White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson',
        'Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen',
        'Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera',
        'Campbell','Mitchell','Carter','Roberts'
    ];

    -- ── Loop vars ──
    i            INT;
    ctrl_num     TEXT;
    fname        TEXT;
    lname        TEXT;
    full_nm      TEXT;
    email_addr   TEXT;
    dept_id      UUID;
    pos_id       UUID;
    sup_id       UUID;
    bu_name      TEXT;
    dept_name    TEXT;
    pos_name     TEXT;
    hire_date    DATE;
    rand_roll    INT;
    year_weight  INT;
    chosen_yr    INT;
    total_weight INT;
    cumulative   INT;
    yr           INT;

BEGIN
    -- ── Load ref IDs into arrays ──
    SELECT ARRAY_AGG(id) INTO dept_ids FROM public.ref_departments WHERE is_active = true;
    SELECT ARRAY_AGG(id) INTO pos_ids  FROM public.ref_positions  WHERE is_active = true;
    SELECT ARRAY_AGG(id) INTO sup_ids  FROM public.ref_superior   WHERE is_active = true;

    -- Total weight for hire year distribution:
    -- sum of (hire_year_max - hire_year_min + 1) down to 1
    total_weight := (hire_year_max - hire_year_min + 1) * (hire_year_max - hire_year_min + 2) / 2;

    FOR i IN 1..total_employees LOOP

        -- ── Build name + email ──
        fname      := first_names[1 + floor(random() * array_length(first_names, 1))::INT];
        lname      := last_names [1 + floor(random() * array_length(last_names,  1))::INT];
        full_nm    := fname || ' ' || lname;
        ctrl_num   := 'EMP-' || LPAD((i + 4)::TEXT, 5, '0'); -- starts AFTER REAL-004
        email_addr := lower(fname) || '.' || lower(lname) || '.' || (i + 4)::TEXT || '@tdk.sim.com';

        -- ── Pick ref values ──
        dept_id   := dept_ids[1 + floor(random() * array_length(dept_ids, 1))::INT];
        pos_id    := pos_ids [1 + floor(random() * array_length(pos_ids,  1))::INT];
        sup_id    := sup_ids [1 + floor(random() * array_length(sup_ids,  1))::INT];
        bu_name   := bu_names[1 + floor(random() * array_length(bu_names, 1))::INT];

        -- Get text names for legacy text columns
        SELECT name INTO dept_name FROM public.ref_departments WHERE id = dept_id;
        SELECT name INTO pos_name  FROM public.ref_positions  WHERE id = pos_id;

        -- ── Weighted date_hired (more in 2015, fewer in 2025) ──
        -- Roll a random int in [1, total_weight]
        rand_roll  := 1 + floor(random() * total_weight)::INT;
        cumulative := 0;
        chosen_yr  := hire_year_max; -- fallback
        FOR yr IN hire_year_min..hire_year_max LOOP
            year_weight := hire_year_max - yr + 1;
            cumulative  := cumulative + year_weight;
            IF rand_roll <= cumulative THEN
                chosen_yr := yr;
                EXIT;
            END IF;
        END LOOP;

        -- Random date within chosen year (Jan–Dec)
        hire_date := make_date(
            chosen_yr,
            1 + floor(random() * 12)::INT,
            1 + floor(random() * 28)::INT  -- safe max day = 28
        );

        -- ── Insert (skip if control_number or email already exists) ──
        INSERT INTO public.company_directory
            (control_number, full_name, email, department, department_id,
             position, position_id, superior_id, intermediate_supervisor,
             business_unit, date_hired, is_active)
        VALUES
            (ctrl_num, full_nm, email_addr, dept_name, dept_id,
             pos_name, pos_id, sup_id, (SELECT name FROM public.ref_superior WHERE id = sup_id),
             bu_name, hire_date, true)
        ON CONFLICT (email) DO NOTHING;

    END LOOP;

    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE 'Profiles to seed : %', profiles_to_seed;
    RAISE NOTICE 'Directory seeded : % (×1.5)', total_employees;
    RAISE NOTICE '════════════════════════════════════════';
END $$;

-- ── Verification ──
SELECT
    COUNT(*)                                          AS total_rows,
    COUNT(*) FILTER (WHERE date_hired < '2018-01-01') AS hired_before_2018,
    COUNT(*) FILTER (WHERE date_hired >= '2018-01-01'
                       AND date_hired < '2022-01-01') AS hired_2018_2021,
    COUNT(*) FILTER (WHERE date_hired >= '2022-01-01') AS hired_2022_plus,
    MIN(date_hired)                                   AS earliest_hire,
    MAX(date_hired)                                   AS latest_hire
FROM public.company_directory
WHERE email LIKE '%@tdk.sim.com';
