
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CareerGrowthPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-6">Career Architecture</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* 1. The Timeline (Trend) */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-400">Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed border-white/10 bg-white/5">
                            <p className="text-sm text-muted-foreground">Viz: Trend Line (Last 12 Months)</p>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. The Heatmap (Department) */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-400">Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed border-white/10 bg-white/5">
                            <p className="text-sm text-muted-foreground">Viz: Horizontal Bar Chart</p>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. The Correlation (Root Cause) */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-400">Root Cause</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed border-white/10 bg-white/5">
                            <p className="text-sm text-muted-foreground">Viz: Correlation Stat Card</p>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. The Voice (Qualitative) */}
                <Card className="bg-[#1a1a1c]/50 border-white/5 backdrop-blur-xl col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-400">Qualitative</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed border-white/10 bg-white/5">
                            <p className="text-sm text-muted-foreground">Viz: Latest Comments Feed</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
