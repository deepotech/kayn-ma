import { ListingStatus } from "@/lib/dashboard-types";

const STATUS_CONFIG: Record<string, { labelAr: string; labelFr: string; classes: string }> = {
    approved: {
        labelAr: 'نشط',
        labelFr: 'Actif',
        classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    },
    pending_review: {
        labelAr: 'قيد المراجعة',
        labelFr: 'En Attente',
        classes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
    },
    rejected: {
        labelAr: 'مرفوض',
        labelFr: 'Rejeté',
        classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    },
    hidden: {
        labelAr: 'مخفي',
        labelFr: 'Masqué',
        classes: 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-400'
    },
    paused: {
        labelAr: 'متوقف',
        labelFr: 'En Pause',
        classes: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    }
};

export default function BadgeStatus({ status, locale }: { status: ListingStatus | string; locale: string }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG['hidden'];
    const label = locale === 'ar' ? config.labelAr : config.labelFr;

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.classes}`}>
            {label}
        </span>
    );
}

// ----------------------------------------------------------------------

import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    color?: 'blue' | 'green' | 'purple' | 'orange';
}

export function StatCard({ title, value, icon: Icon, trend, color = 'blue' }: StatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    };

    return (
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
                {trend && <p className="text-xs text-green-500 mt-1 font-medium">{trend}</p>}
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                <Icon className="h-6 w-6" />
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isDestructive?: boolean;
    isLoading?: boolean;
    cancelLabel?: string;
    confirmLabel?: string;
}

export function ConfirmModal({
    isOpen, onClose, onConfirm, title, message,
    isDestructive = false, isLoading = false,
    cancelLabel = 'Cancel', confirmLabel = 'Confirm'
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                    {message}
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${isDestructive
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? '...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
