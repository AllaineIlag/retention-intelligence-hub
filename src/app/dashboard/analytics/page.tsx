import { Suspense } from 'react';
import { AnalyticsFilters } from '@/app/actions/analytics';
import { parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';

// import { HorizontalBarList } from '@/components/dashboard/analytics/charts/HorizontalBarList';
// import { CareerGrowthChart } from '@/components/dashboard/charts/career-growth';
// import { RateOfPayChart } from '@/components/dashboard/charts/rate-of-pay';
// import { RatingDistribution } from '@/components/dashboard/analytics/charts/RatingDistribution';
// import { DonutChart } from '@/components/dashboard/analytics/charts/DonutChart';

export default async function AnalyticsPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;

    // Extract Filters
    const filters: AnalyticsFilters = {
        startDate: params.from ? parseISO(params.from as string) : undefined,
        endDate: params.to ? parseISO(params.to as string) : undefined,
        department: params.dept ? [params.dept as string] : undefined,
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <Suspense fallback={<AnalyticsSkeleton />}>
                <AnalyticsContent filters={filters} />
            </Suspense>
        </div>
    );
}

async function AnalyticsContent({ filters }: { filters: AnalyticsFilters }) {
    // const questionsRes = await getExitQuestionStats(filters);
    // const questionStats = questionsRes.success ? questionsRes.data || [] : [];
    // const getStats = (key: string) => questionStats.find(q => q.question_key === key);

    return (
        <div className="space-y-4">
            {/* Content cleared as per request */}
        </div>
    );
}

function AnalyticsSkeleton() {
    return (
        <div className="flex items-center justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
}
