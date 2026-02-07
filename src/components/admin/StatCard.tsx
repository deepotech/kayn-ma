import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
    isLoading?: boolean;
}

const colorMap = {
    blue: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-500',
        border: 'border-blue-500',
    },
    green: {
        bg: 'bg-green-500/10',
        text: 'text-green-500',
        border: 'border-green-500',
    },
    yellow: {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-500',
        border: 'border-yellow-500',
    },
    red: {
        bg: 'bg-red-500/10',
        text: 'text-red-500',
        border: 'border-red-500',
    },
    purple: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-500',
        border: 'border-purple-500',
    },
};

export default function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    color = 'blue',
    isLoading = false
}: StatCardProps) {
    const colors = colorMap[color];

    return (
        <div className={`bg-zinc-800/50 border-l-4 ${colors.border} rounded-xl p-6 transition-all hover:bg-zinc-800`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-zinc-400 mb-1">{title}</p>
                    {isLoading ? (
                        <div className="h-8 w-20 bg-zinc-700 rounded animate-pulse"></div>
                    ) : (
                        <h3 className="text-2xl font-bold text-white">{value}</h3>
                    )}
                    {trend && !isLoading && (
                        <p className={`text-xs mt-2 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${colors.bg}`}>
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                </div>
            </div>
        </div>
    );
}
