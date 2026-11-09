import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Flash } from '@/types';

export default function FlashAlert() {
    const { flash } = usePage<{ flash?: Flash }>().props;
    const [visible, setVisible] = useState(false);
    const [currentMessage, setCurrentMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    useEffect(() => {
        if (flash?.success) {
            setCurrentMessage({ type: 'success', text: flash.success });
            setVisible(true);
        } else if (flash?.error) {
            setCurrentMessage({ type: 'error', text: flash.error });
            setVisible(true);
        }
    }, [flash]);

    useEffect(() => {
        if (!visible) return;

        const timer = setTimeout(() => {
            setVisible(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, [visible, currentMessage]);

    if (!visible || !currentMessage) {
        return null;
    }

    const isSuccess = currentMessage.type === 'success';

    return (
        <div className="mb-6 w-full animate-in duration-300 fade-in">
            <div
                className={`relative flex items-center justify-between gap-3 rounded-lg border p-4 shadow-sm ${
                    isSuccess
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200'
                        : 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200'
                }`}
                role="alert"
            >
                <div className="flex items-center gap-3">
                    {isSuccess ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                    )}
                    <span className="text-sm font-medium">
                        {currentMessage.text}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className={`rounded-md p-1 transition hover:opacity-75 focus:ring-2 focus:outline-none ${
                        isSuccess
                            ? 'text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
                            : 'text-red-700 hover:bg-red-100 focus:ring-red-500 dark:text-red-300 dark:hover:bg-red-900/50'
                    }`}
                    aria-label="Close alert"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
