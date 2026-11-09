import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaginatedData } from '@/types';

type PaginationProps<T> = {
    data: PaginatedData<T>;
    className?: string;
};

export default function Pagination<T>({ data, className }: PaginationProps<T>) {
    if (data.total === 0) {
        return null;
    }

    const cleanLabel = (label: string) => {
        if (label.includes('Previous')) {
            return (
                <span className="flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                </span>
            );
        }
        if (label.includes('Next')) {
            return (
                <span className="flex items-center gap-1">
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                </span>
            );
        }
        return label;
    };

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-between gap-4 border-t border-border px-4 py-3 sm:flex-row sm:px-6',
                className,
            )}
        >
            <div className="text-xs text-muted-foreground">
                Showing{' '}
                <span className="font-semibold text-foreground">
                    {data.from ?? 0}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-foreground">
                    {data.to ?? 0}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-foreground">
                    {data.total}
                </span>{' '}
                results
            </div>

            {data.last_page > 1 && (
                <nav
                    className="flex flex-wrap items-center gap-1"
                    aria-label="Pagination Navigation"
                >
                    {data.links.map((link, index) => {
                        const isPrev = index === 0;
                        const isNext = index === data.links.length - 1;

                        if (!link.url) {
                            return (
                                <span
                                    key={index}
                                    className={cn(
                                        'inline-flex h-8 cursor-not-allowed items-center justify-center rounded-md border border-input bg-background/50 px-3 text-xs text-muted-foreground/50 opacity-60',
                                        !isPrev && !isNext && 'w-8 px-0',
                                    )}
                                    aria-disabled="true"
                                >
                                    {cleanLabel(link.label)}
                                </span>
                            );
                        }

                        return (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                preserveState
                                className={cn(
                                    'inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none',
                                    link.active
                                        ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                        : 'border-input bg-background hover:bg-muted hover:text-foreground',
                                    !isPrev && !isNext && 'w-8 px-0',
                                )}
                                aria-current={link.active ? 'page' : undefined}
                            >
                                {cleanLabel(link.label)}
                            </Link>
                        );
                    })}
                </nav>
            )}
        </div>
    );
}
