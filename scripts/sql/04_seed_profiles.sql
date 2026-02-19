-- ═══════════════════════════════════════════════════════════
-- 04: SEED PROFILES + EMPLOYEE DETAILS (Run FIRST when seeding)
-- ═══════════════════════════════════════════════════════════


DO $$
DECLARE
    -- ┌──────────────────────────────────────────────────────────────┐
    -- │  SCENARIO CONFIG: Define your retention scenario here      │
    -- └──────────────────────────────────────────────────────────────┘
    total_employees INT := 5000;   -- Reference size for calculation
    annual_attrition_pct FLOAT := 0.2; -- 20% annual turnover
    history_months INT := 12;      -- Total months to simulate
    variance_pct FLOAT := 0.05;    -- +/- 5% monthly variance buffer
    
    max_tenure_years INT := 5;     -- Maximum years of employment
    
    -- AUTOMATICALLY CALCULATED
    avg_exits_per_month FLOAT := total_employees * (annual_attrition_pct / 12);
    max_exits_per_month INT := ceil(avg_exits_per_month * (1 + variance_pct));
    num_profiles INT := (max_exits_per_month * history_months);
    
    -- Align with src/constants/enums.ts and ref_ tables
    departments TEXT[] := ARRAY[
        'Engineering', 'Product Management', 'Design', 'Sales', 'Marketing', 
        'Customer Success', 'Human Resources', 'Finance', 'Legal', 'Operations', 'IT', 'Data Science'
    ];
    positions TEXT[] := ARRAY[
        'Software Engineer', 'Senior Software Engineer', 'Tech Lead', 'Product Manager', 
        'UI/UX Designer', 'QA Engineer', 'Marketing Manager', 'HR Representative', 'Operations Specialist'
    ];
    superiors TEXT[] := ARRAY[
        'Alex Chen', 'Sarah Connor', 'Mike Ross', 'Jessica Pearson', 
        'Harvey Specter', 'Louis Litt', 'Rachel Zane', 'Donna Paulsen'
    ];
    
    first_names TEXT[] := ARRAY['James', 'Maria', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'Richard', 'Barbara', 'Joseph', 'Susan', 'Thomas', 'Jessica', 'Christopher', 'Sarah', 'Charles', 'Karen', 'Daniel', 'Lisa', 'Matthew', 'Nancy', 'Anthony', 'Betty', 'Mark', 'Margaret', 'Andrew', 'Sandra', 'Joshua', 'Ashley', 'Kenneth', 'Dorothy', 'Kevin', 'Kimberly', 'Brian', 'Emily', 'George', 'Donna'];
    last_names TEXT[] := ARRAY['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];
    
    i INT;
    new_id UUID;
    fname TEXT;
    lname TEXT;
    email_addr TEXT;
    tenure_days INT;
BEGIN
    FOR i IN 1..num_profiles LOOP
        new_id := gen_random_uuid();
        fname := first_names[1 + floor(random() * array_length(first_names, 1))::int];
        lname := last_names[1 + floor(random() * array_length(last_names, 1))::int];
        email_addr := lower(fname || '.' || lname || '.' || i || '@sim.retention.com');

        -- Calculate random tenure details
        tenure_days := floor(random() * (max_tenure_years * 365)) + 30; -- At least 30 days

        -- Insert profile
        INSERT INTO profiles (id, email, role, status)
        VALUES (
            new_id,
            email_addr,
            'employee',
            'active'
        ) ON CONFLICT (id) DO NOTHING;

        -- Insert employee details
        INSERT INTO employee_details (id, employee_number, full_name, department, current_position, date_hired, immediate_superior)
        VALUES (
            new_id,
            'SIM-' || upper(substr(md5(random()::text), 1, 6)),
            fname || ' ' || lname,
            departments[1 + floor(random() * array_length(departments, 1))::int],
            positions[1 + floor(random() * array_length(positions, 1))::int],
            (CURRENT_DATE - (tenure_days || ' days')::interval)::date,
            superiors[1 + floor(random() * array_length(superiors, 1))::int]

        ) ON CONFLICT (id) DO NOTHING;
    END LOOP;

    RAISE NOTICE 'Scenario: % total workforce, % annual attrition', total_employees, (annual_attrition_pct*100);
    RAISE NOTICE 'Seeding % profiles (Targeting ONLY resignations, 0 active buffer)', num_profiles;
END $$;

-- Verify
SELECT COUNT(*) AS total_sim_profiles 
FROM profiles 
WHERE email ILIKE '%@sim.retention.com';
