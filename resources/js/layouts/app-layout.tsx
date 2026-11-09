import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import FlashAlert from '@/components/flash-alert';
import type { AppLayoutProps } from '@/types';

export default function AppLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="min-w-0 overflow-x-clip">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="flex-1 px-4 py-4 md:px-6 md:py-6">
                    <FlashAlert />
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
