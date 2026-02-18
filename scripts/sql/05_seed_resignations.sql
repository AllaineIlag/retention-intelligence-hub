-- ═══════════════════════════════════════════════════════════
-- 05: SEED RESIGNATIONS (Run AFTER 04_seed_profiles)
-- ═══════════════════════════════════════════════════════════

-- ┌──────────────────────────────────────────────────────────────┐
-- │  CONFIGURABLE: Change months_back & exits_per_month below   │
-- └──────────────────────────────────────────────────────────────┘
DO $$
DECLARE
    -- ┌──────────────────────────────────────────────────────────────┐
    -- │  SCENARIO CONFIG: Must match 04_seed_profiles.sql            │
    -- └──────────────────────────────────────────────────────────────┘
    months_back INT := 12;          -- History window
    total_employees INT := 5000;    -- Total Workforce
    annual_attrition_pct FLOAT := 0.2; -- 20% annual turnover (matches 04)
    variance_pct FLOAT := 0.05;     -- +/- 5% variance per month
    
    -- Calculations
    avg_exits_per_month FLOAT := total_employees * (annual_attrition_pct / 12);
    
    completion_rate FLOAT := 0.85; -- 85% completed
    cancel_rate FLOAT := 0.05;     -- 5% cancelled
    
    statuses TEXT[] := ARRAY['completed', 'cancelled', 'pending', 'scheduled'];
    
    
    employee_ids UUID[];
    emp_id UUID;
    m INT;
    i INT;
    month_date TIMESTAMP;
    resign_date TIMESTAMP;
    status_val TEXT;
    rand_val FLOAT;
    idx INT := 0;
    
    -- Dynamic variance variables
    current_month_target INT;
    variance_factor FLOAT;
BEGIN
    -- Get all sim employees
    SELECT array_agg(id) INTO employee_ids
    FROM profiles
    WHERE email ILIKE '%@sim.retention.com';

    IF employee_ids IS NULL OR array_length(employee_ids, 1) = 0 THEN
        RAISE EXCEPTION 'No simulation profiles found. Run 04_seed_profiles.sql first.';
    END IF;

    -- Shuffle the array
    employee_ids := (
        SELECT array_agg(id ORDER BY random())
        FROM unnest(employee_ids) AS id
    );

    FOR m IN 0..(months_back - 1) LOOP
        month_date := date_trunc('month', CURRENT_TIMESTAMP - (m || ' months')::interval);

        -- CALCULATE DYNAMIC TARGET FOR THIS MONTH
        -- Formula: Average * (1 + (Random between -Variance and +Variance))
        -- e.g. 0.05 variance => multiplier between 0.95 and 1.05
        variance_factor := (random() * (variance_pct * 2)) - variance_pct;
        current_month_target := floor(avg_exits_per_month * (1 + variance_factor));
        
        -- RAISE NOTICE 'Month %: Target % exits (Variance %)', m, current_month_target, variance_factor;

        FOR i IN 1..current_month_target LOOP
            idx := idx + 1;
            IF idx > array_length(employee_ids, 1) THEN
                RAISE NOTICE 'Ran out of employees at % resignations', idx - 1;
                EXIT; -- Stop if we run out of profiles
            END IF;

            emp_id := employee_ids[idx];

            -- Random date within the month
            resign_date := month_date + (floor(random() * 28) || ' days')::interval 
                         + (floor(random() * 24) || ' hours')::interval;

            -- Determine status
            rand_val := random();
            IF rand_val < completion_rate THEN
                status_val := 'completed';
            ELSIF rand_val < completion_rate + cancel_rate THEN
                status_val := 'cancelled';
            ELSIF random() > 0.5 THEN
                status_val := 'scheduled';
            ELSE
                status_val := 'pending_exit_form';
            END IF;

            INSERT INTO resignations (id, employee_id, status, created_at, last_working_day)
            VALUES (
                gen_random_uuid(),
                emp_id,
                status_val::resignation_status,
                resign_date,
                (resign_date + interval '14 days')
            );
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Created % resignations (Utilization: % of % seeded profiles)', idx, round((idx::numeric / array_length(employee_ids, 1)::numeric) * 100, 1), array_length(employee_ids, 1);
END $$;

-- Verify
SELECT status, COUNT(*) 
FROM resignations 
GROUP BY status 
ORDER BY COUNT(*) DESC;
