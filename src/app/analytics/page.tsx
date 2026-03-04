'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { HorizontalBarList } from '@/components/dashboard/analytics/charts/HorizontalBarList';
import { TrendComparisonChart } from '@/components/dashboard/analytics/charts/TrendComparisonChart';
import { DepartmentChart } from '@/components/dashboard/analytics/charts/DepartmentChart';
import { TurnoverDataPoint, ComparisonDataPoint } from '@/app/actions/analytics';

export default function PublicAnalyticsPage() {
    const [loading, setLoading] = useState(false);

    // Mock Data for Visual Testing
    const mockTrendData: TurnoverDataPoint[] = [
        { name: 'Jan', value: 2 },
        { name: 'Feb', value: 5 },
        { name: 'Mar', value: 3 },
        { name: 'Apr', value: 8 },
        { name: 'May', value: 4 },
        { name: 'Jun', value: 6 },
    ];

    const mockDeptData: TurnoverDataPoint[] = [
        { name: 'Engineering', value: 12 },
        { name: 'Sales', value: 8 },
        { name: 'Product', value: 5 },
        { name: 'HR', value: 2 },
    ];

    const mockReasonData: TurnoverDataPoint[] = [
        { name: 'Better Opportunity', value: 15 },
        { name: 'Salary', value: 10 },
        { name: 'Management', value: 5 },
        { name: 'Relocation', value: 3 },
    ];

    const mockComparisonData: ComparisonDataPoint[] = [
        { date: 'Jan', current: 5, previous: 4, fullDateCurrent: 'Jan 2026', fullDatePrevious: 'Dec 2025' },
        { date: 'Feb', current: 8, previous: 6, fullDateCurrent: 'Feb 2026', fullDatePrevious: 'Jan 2026' },
        { date: 'Mar', current: 3, previous: 3, fullDateCurrent: 'Mar 2026', fullDatePrevious: 'Feb 2026' },
        { date: 'Apr', current: 6, previous: 2, fullDateCurrent: 'Apr 2026', fullDatePrevious: 'Mar 2026' },
    ];

    const summary = {
        totalExits: 45,
        avgTenureMonths: 18
    };

    // const handleFilterChange = async (filters: any) => {
    //     setLoading(true);
    //     // Simulate network delay
    //     setTimeout(() => setLoading(false), 800);
    // };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 bg-background min-h-screen">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Analytics analytics (Visual Model)</h2>
            </div>

            {/* <AnalyticsFilters onFilterChange={handleFilterChange} /> - REMOVED for Cleanup */}

            {loading && (
                <div className="flex items-center justify-center p-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {!loading && (
                <div className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Exits</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.totalExits}</div>
                                <p className="text-xs text-muted-foreground">
                                    in selected period
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Tenure</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.avgTenureMonths} <span className="text-sm font-normal text-muted-foreground">mos</span></div>
                                <p className="text-xs text-muted-foreground">
                                    average employment duration
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <TrendComparisonChart
                            title="Turnover Trends (Mock)"
                            data={mockComparisonData}
                            meta={{ currentLabel: 'Current Period', previousLabel: 'Previous Period' }}
                        />
                        <DepartmentChart data={mockDeptData} />
                    </div>

                    {/* Detailed Analysis */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <HorizontalBarList
                            title="Reason for Leaving (Mock)"
                            description="Visual test for bar list"
                            data={mockReasonData}
                            totalResponses={45}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
