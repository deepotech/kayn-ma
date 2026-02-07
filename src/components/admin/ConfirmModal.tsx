'use client';

import { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason?: string) => Promise<void> | void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    showReasonInput?: boolean;
    reasonPlaceholder?: string;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    variant = 'danger',
    showReasonInput = false,
    reasonPlaceholder = 'Raison...',
}: ConfirmModalProps) {
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: 'bg-red-500/20 text-red-400',
            button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        },
        warning: {
            icon: 'bg-yellow-500/20 text-yellow-400',
            button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        },
        info: {
            icon: 'bg-blue-500/20 text-blue-400',
            button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        },
    };

    const styles = variantStyles[variant];

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm(showReasonInput ? reason : undefined);
            onClose();
        } catch (error) {
            console.error('Confirm action failed:', error);
        } finally {
            setIsLoading(false);
            setReason('');
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setReason('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Icon */}
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${styles.icon}`}>
                    <AlertTriangle className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white text-center mb-2">{title}</h3>
                <p className="text-zinc-400 text-center mb-6">{message}</p>

                {/* Reason input */}
                {showReasonInput && (
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={reasonPlaceholder}
                        rows={3}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-6 resize-none"
                    />
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || (showReasonInput && !reason.trim())}
                        className={`flex-1 px-4 py-3 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 flex items-center justify-center gap-2 ${styles.button}`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>...</span>
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
