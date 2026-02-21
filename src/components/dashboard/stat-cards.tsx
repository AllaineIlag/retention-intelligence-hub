'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/app/actions/dashboard';
import { Users, UserMinus, Activity, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardsProps {
    stats: DashboardStats;
}

export function StatCards({ stats }: StatCardsProps) {
    const cards = [
        {
            title: 'Total Employees',
            value: stats.totalEmployees,
            icon: Users,
            description: 'Active profiles',
        },
        {
            title: 'Active Resignations',
            value: stats.activeResignations,
            icon: Activity,
            description: 'Pending or Scheduled',
            color: 'text-amber-500',
        },
        {
            title: 'Retention Rate',
            value: `${stats.retentionRate}%`,
            icon: UserMinus, // or Heart
            description: 'Based on current data',
            color: parseFloat(stats.retentionRate.toString()) > 90 ? 'text-emerald-500' : 'text-rose-500',
        },
        {
            title: 'Corrected Interviews',
            value: stats.misunderstoodCount,
            icon: AlertCircle,
            description: 'Total corrections logged',
            color: 'text-brand-primary',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {cards.map((card, index) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className="relative overflow-hidden border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all hover:bg-white/[0.04] hover:border-white/10 group">
                        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <card.icon className={`h-4 w-4 text-muted-foreground transition-colors group-hover:text-brand-primary ${card.color || ''}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">{card.value}</div>
                            <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-tight">
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
