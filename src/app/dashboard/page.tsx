import { Suspense } from 'react';

import { getDashboardStats, getRecentResignations } from '@/app/actions/dashboard';
import {
    getAnalyticsSummary,
    getTurnoverTrends,
    getDepartmentBreakdown,
    getCountryStats,
    getExitQuestionStats
} from '@/app/actions/analytics';
import { StatCards } from '@/components/dashboard/stat-cards';
import { RecentResignationsTable } from '@/components/dashboard/recent-resignations-table';
import { HeroTurnoverChart } from '@/components/dashboard/analytics/charts/HeroTurnoverChart';
import { QuickWinsCharts } from '@/components/dashboard/analytics/charts/QuickWinsCharts';
import { RingMetricCard } from '@/components/dashboard/analytics/charts/RingMetricCard';
import { CountryPieChart } from '@/components/dashboard/analytics/charts/CountryPieChart';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-700 p-2">

            {/* MAIN GRID: Left Content (KPIs + Hero + Table/Pie) vs Right Rail (Stats Stack) */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">

                {/* LEFT MAIN CONTENT (3 Cols) */}
                <div className="lg:col-span-3 space-y-6">
                    {/* ROW 1: KPI Cards */}
                    <div className="w-full">
                        <Suspense fallback={<StatsSkeleton />}>
                            <KPISection />
                        </Suspense>
                    </div>

                    {/* Hero Chart */}
                    <div className="w-full">
                        <Suspense fallback={<ChartSkeleton />}>
                            <HeroSection />
                        </Suspense>
                    </div>

                    {/* Bottom Split: Table & Country Pie */}
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-10">
                        <div className="lg:col-span-7">
                            <Suspense fallback={<TableSkeleton />}>
                                <RecentResignationsSection />
                            </Suspense>
                        </div>
                        <div className="lg:col-span-3">
                            <Suspense fallback={<WidgetSkeleton />}>
                                <CountrySection />
                            </Suspense>
                        </div>
                    </div>
                </div>

                {/* RIGHT RAIL (1 Col) - Spans Full Height */}
                <div className="lg:col-span-1 h-full">
                    <Suspense fallback={<WidgetSkeleton />}>
                        <QuickWinsSection />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// DATA FETCHING COMPONENTS
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// DATA FETCHING COMPONENTS
// ------------------------------------------------------------------

async function KPISection() {
    // MOCK DATA for "2% Strategy" Visualization
    // const summaryRes = await getAnalyticsSummary({});

    // Static Scenario: 
    // - Turnover Alert: 2.1% (Red/Warning)
    // - Top Reason: Better Opportunity (Career Growth)
    // - Rec: 68% (Low)
    // - Tenure: 18 months

    const summary = {
        totalExits: 105,
        turnoverRate: 2.1, // > 2.0% Threshold -> Should be Red/Warning
        avgTenureMonths: 18,
        primaryDriver: { reason: 'Better Opportunity', count: 45, percentage: 42 }
    };

    const recPercent = 68; // Net Promoter Score

    // 4 Cards: Turnover, Top Exit Reason, Recommendation, Tenure
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {/* 1. Turnover Rate */}
            <RingMetricCard
                title="Turnover Rate"
                value={`${summary.turnoverRate}%`}
                subtext="Monthly Rate"
                progress={Math.min((summary.turnoverRate / 3) * 100, 100)}
                color={summary.turnoverRate > 2.2 ? '#f43f5e' : '#10b981'}
            />

            {/* 2. Top Exit Reason */}
            <RingMetricCard
                title="Top Exit Reason"
                value={`${summary.primaryDriver.percentage}%`}
                subtext={summary.primaryDriver.reason}
                progress={summary.primaryDriver.percentage}
                color="#f59e0b"
            />

            {/* 3. Recommendation */}
            <RingMetricCard
                title="Would Recommend"
                value={`${recPercent}%`}
                subtext="Promoter Score"
                progress={recPercent}
                color={recPercent >= 50 ? '#10b981' : '#f43f5e'}
            />

            {/* 4. Tenure */}
            <RingMetricCard
                title="Avg. Tenure"
                value={`${summary.avgTenureMonths} mo`}
                subtext="Length of Service"
                progress={Math.min((summary.avgTenureMonths / 36) * 100, 100)}
                color="#6366f1"
            />
        </div>
    );
}

async function HeroSection() {
    // MOCK DATA for Hero Chart

    // Department Breakdown (Bar)
    const deptData = [
        { name: 'Engineering', value: 24, fill: '#6366f1' },
        { name: 'Sales', value: 18, fill: '#8b5cf6' },
        { name: 'Customer Support', value: 12, fill: '#14b8a6' },
        { name: 'Product', value: 8, fill: '#10b981' },
        { name: 'Marketing', value: 6, fill: '#f59e0b' },
    ];

    // Monthly Trend (Area) - Showing spike over 2%
    // Needs to match { name, resignations, retention }
    const monthData = [
        { name: 'Jan', resignations: 1.2, retention: 98.8 },
        { name: 'Feb', resignations: 1.1, retention: 98.9 },
        { name: 'Mar', resignations: 1.3, retention: 98.7 },
        { name: 'Apr', resignations: 1.5, retention: 98.5 },
        { name: 'May', resignations: 1.8, retention: 98.2 },
        { name: 'Jun', resignations: 2.1, retention: 97.9 }, // Alert
        { name: 'Jul', resignations: 2.3, retention: 97.7 }, // Alert
        { name: 'Aug', resignations: 2.1, retention: 97.9 }, // Alert
    ];

    return (
        <HeroTurnoverChart
            deptData={deptData}
            monthData={monthData}
        />
    );
}

async function QuickWinsSection() {
    // MOCK DATA for Quick Wins

    // 1. Pull Factors: Why go?
    const pullFactors = [
        { name: 'Higher Base Salary', value: 45 },
        { name: 'Remote Options', value: 32 },
        { name: 'Better Benefits', value: 28 },
    ];

    // 2. Career Growth: Q3
    const careerGrowth = [
        { name: 'No Growth', value: 40 },
        { name: 'Limited Path', value: 35 },
        { name: 'Good', value: 25 },
    ];

    // 3. Pay Rate: Q4
    const payPerception = [
        { name: 'Underpaid', value: 55 },
        { name: 'Fair', value: 30 },
        { name: 'Well Paid', value: 15 },
    ];

    // 4. Benefits: Q5
    const benefits = [
        { name: 'Inadequate', value: 48 },
        { name: 'Adequate', value: 35 },
        { name: 'Very Adequate', value: 17 },
    ];

    // 5. Amount of Work: Q6
    const workload = [
        { name: 'Too Much', value: 60 },
        { name: 'Just Right', value: 30 },
        { name: 'Minimal', value: 10 },
    ];

    return (
        <QuickWinsCharts
            pullFactors={pullFactors}
            careerGrowth={careerGrowth}
            payPerception={payPerception}
            benefits={benefits}
            workload={workload}
        />
    );
}

async function RecentResignationsSection() {
    // MOCK DATA for Table
    const recentResignations = [
        {
            id: '1',
            profiles: {
                full_name: 'Sarah Connor',
                employee_number: 'E-001',
                email: 'sarah.connor@example.com',
                role: 'employee',
                department: 'Engineering'
            },
            status: 'pending',
            last_working_day: '2026-02-15T00:00:00Z',
        },
        {
            id: '2',
            profiles: {
                full_name: 'John Wick',
                employee_number: 'E-101',
                email: 'john.wick@example.com',
                role: 'lead',
                department: 'Sales'
            },
            status: 'scheduled',
            last_working_day: '2026-02-20T00:00:00Z',
        },
        {
            id: '3',
            profiles: {
                full_name: 'Ellen Ripley',
                employee_number: 'E-456',
                email: 'ellen.ripley@example.com',
                role: 'interviewer',
                department: 'Operations'
            },
            status: 'completed',
            last_working_day: '2026-01-30T00:00:00Z',
        },
        {
            id: '4',
            profiles: {
                full_name: 'Tony Stark',
                employee_number: 'E-999',
                email: 'tony.stark@example.com',
                role: 'lead',
                department: 'Research'
            },
            status: 'verified',
            last_working_day: '2026-01-15T00:00:00Z',
        },
        {
            id: '5',
            profiles: {
                full_name: 'Bruce Wayne',
                employee_number: 'E-007',
                email: 'bruce.wayne@example.com',
                role: 'lead',
                department: 'Finance'
            },
            status: 'declined',
            last_working_day: '2026-03-01T00:00:00Z',
        }
    ];

    // Type assertion to bypass strict typing for mock data
    return <RecentResignationsTable resignations={recentResignations as any} />;
}

async function CountrySection() {
    // MOCK DATA for Country Pie
    const data = [
        { name: 'United States', value: 35, fill: '#6366f1' },
        { name: 'Singapore', value: 25, fill: '#8b5cf6' },
        { name: 'Australia', value: 20, fill: '#14b8a6' },
        { name: 'Canada', value: 15, fill: '#f59e0b' },
        { name: 'Other', value: 5, fill: '#64748b' },
    ];

    return <CountryPieChart data={data} />;
}


// ------------------------------------------------------------------
// LOADING SKELETONS
// ------------------------------------------------------------------

function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-xl border bg-card/50 p-6">
                    <Skeleton className="h-4 w-[100px] mb-4" />
                    <Skeleton className="h-8 w-[60px]" />
                </div>
            ))}
        </div>
    );
}

function ChartSkeleton() {
    return (
        <div className="h-[400px] rounded-xl border bg-card/50 p-6 flex flex-col space-y-4">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-full w-full opacity-20" />
        </div>
    );
}

function WidgetSkeleton() {
    return (
        <div className="h-[200px] rounded-xl border bg-card/50 p-6 flex flex-col space-y-4">
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-full w-full opacity-20" />
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-card/50 p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-10 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}
