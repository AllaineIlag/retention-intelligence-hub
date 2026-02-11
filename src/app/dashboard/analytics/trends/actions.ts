'use server'

import { createClient } from '@/lib/supabase/server'
import { addMonths, differenceInMonths, parseISO, startOfMonth, subMonths } from 'date-fns'

export interface RetentionMetrics {
    newHireDropout: {
        count: number
        rate: number
        trend: number
    }
    stagnation: {
        count: number
        rate: number
    }
    managerLoss: {
        count: number
    }
    retentionCurve: {
        name: string
        value: number
    }[]
    flightRisk: {
        department: string
        hires: number
        dropouts: number
        rate: number
    }[]
}

export async function getRetentionMetrics(): Promise<RetentionMetrics> {
    const supabase = await createClient()

    // 1. Fetch relevant data from employee_details
    // status: 'Resigned' or 'Active' (we need to infer active if not resigned, or use profiles status?)
    // Actually, employee_details doesn't have a status column in the schema shared earlier?
    // Let's check schema again. `resignation_date` is present. If null, active.

    const { data: employees, error } = await supabase
        .from('employee_details')
        .select('id, date_hired, resignation_date, position_when_hired, current_position, department, created_at')

    if (error) {
        console.error('Error fetching retention metrics:', error)
        return {
            newHireDropout: { count: 0, rate: 0, trend: 0 },
            stagnation: { count: 0, rate: 0 },
            managerLoss: { count: 0 },
            retentionCurve: [],
            flightRisk: []
        }
    }

    const totalEmployees = employees.length
    const resignedEmployees = employees.filter(e => e.resignation_date)
    const activeEmployees = employees.filter(e => !e.resignation_date)

    // --- 1. New Hire Dropout (< 6 months tenure) ---
    const sixMonthsAgo = subMonths(new Date(), 6)

    // Definition: Employees who resigned within 6 months of hiring
    const dropouts = resignedEmployees.filter(e => {
        if (!e.date_hired || !e.resignation_date) return false
        const hired = parseISO(e.date_hired as unknown as string) // Supabase returns string for date
        const resigned = parseISO(e.resignation_date as unknown as string)
        const tenureMonths = differenceInMonths(resigned, hired)
        return tenureMonths < 6
    })

    // Rate: Dropouts / Total Resignations (or Total Hires in that period? Let's use % of Al Leavers for now as general "Bad Hire" ratio, or better: Dropouts / All Employees Hired within last 12-24 months? - Sticking to Dropouts / Total Leavers for "Impact on Exit" or Dropouts count directly)
    // Wireframe says: "Number of employees who left in less than 6 months."
    // Let's return Count and maybe Rate relative to total resignations.
    const dropoutCount = dropouts.length
    const totalResignedCount = resignedEmployees.length
    const dropoutRate = totalResignedCount > 0 ? (dropoutCount / totalResignedCount) * 100 : 0

    // --- 2. Stagnation Rate (Leavers who never received promotion) ---
    // Definition: "Current Position" == "Hired Position" among LEAVERS
    const stagnantLeavers = resignedEmployees.filter(e => {
        // strict string equality might be fragile, but starting point
        return e.position_when_hired === e.current_position
    })

    const stagnationCount = stagnantLeavers.length
    const stagnationRate = totalResignedCount > 0 ? (stagnationCount / totalResignedCount) * 100 : 0

    // --- 3. Manager Loss ---
    // Definition: "Supervisor" or "Manager" in title
    const managerKeywords = ['Manager', 'Supervisor', 'Lead', 'Director', 'Head', 'VP', 'Chief']
    const managerLosses = resignedEmployees.filter(e => {
        const title = e.current_position?.toLowerCase() || ''
        return managerKeywords.some(keyword => title.includes(keyword.toLowerCase()))
    })

    // --- 4. Retention Curve (0, 6, 12, 24 months) ---
    // We need to calculate how many people stay past X months.
    // Method: Kaplan-Meier Survival Analysis simplified.
    // Or simpler snapshot: Of all employees ever hired, what % made it past X months?
    // Let's use "Survival Rate":
    // Bucket 0 (Onboarding): 100% (Start)
    // Bucket 6m: (Total Employees with tenure >= 6m OR Resigned after 6m) / (Total Hires at least 6m ago)

    const now = new Date()

    const calculateSurvival = (months: number) => {
        // Cohort: People hired at least 'months' ago
        const cohort = employees.filter(e => {
            if (!e.date_hired) return false
            const hired = parseISO(e.date_hired as unknown as string)
            return differenceInMonths(now, hired) >= months
        })

        if (cohort.length === 0) return 100

        // Survivors: People from cohort who are either Active OR Resigned AFTER 'months' tenure
        const survivors = cohort.filter(e => {
            if (!e.resignation_date) return true // Active
            const hired = parseISO(e.date_hired as unknown as string)
            const resigned = parseISO(e.resignation_date as unknown as string)
            return differenceInMonths(resigned, hired) >= months
        })

        return (survivors.length / cohort.length) * 100
    }

    const retentionCurve = [
        { name: '0m', value: 100 },
        { name: '6m', value: calculateSurvival(6) },
        { name: '12m', value: calculateSurvival(12) },
        { name: '24m', value: calculateSurvival(24) },
        { name: '36m', value: calculateSurvival(36) },
    ]

    // --- 5. Flight Risk List (Dropout Rate by Dept) ---
    // Group employees by Department
    const departments = [...new Set(employees.map(e => e.department).filter(Boolean))] as string[]

    const flightRisk = departments.map(dept => {
        const deptEmployees = employees.filter(e => e.department === dept)

        // Hires: Filter those hired at least 6 months ago to be fair? Or just all time?
        // Let's look at "New Hire Dropouts" specifically for this dept

        const deptDropouts = deptEmployees.filter(e => {
            if (!e.resignation_date || !e.date_hired) return false
            const hired = parseISO(e.date_hired as unknown as string)
            const resigned = parseISO(e.resignation_date as unknown as string)
            return differenceInMonths(resigned, hired) < 6
        })

        // Rate: Dropouts / Total Dept Employees (Active + Resigned) ? Or Dropouts / Total Hires?
        // Let's use Total Ever Hired in Dept as denominator to see "Burn Rate" of new hires
        const totalDeptHires = deptEmployees.length
        const rate = totalDeptHires > 0 ? (deptDropouts.length / totalDeptHires) * 100 : 0

        return {
            department: dept,
            hires: totalDeptHires,
            dropouts: deptDropouts.length,
            rate: parseFloat(rate.toFixed(1))
        }
    }).sort((a, b) => b.rate - a.rate) // Sort by highest bad hire rate

    return {
        newHireDropout: {
            count: dropoutCount,
            rate: parseFloat(dropoutRate.toFixed(1)),
            trend: 0 // Placeholder
        },
        stagnation: {
            count: stagnationCount,
            rate: parseFloat(stagnationRate.toFixed(1))
        },
        managerLoss: {
            count: managerLosses.length
        },
        retentionCurve,
        flightRisk: flightRisk.slice(0, 5) // Top 5
    }
}
