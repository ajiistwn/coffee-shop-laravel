import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { type BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
    cartCount,
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[]; cartCount?: number }>) {
    return (
        <AppShell>
            <AppHeader breadcrumbs={breadcrumbs} cartCount={cartCount} />
            <AppContent>{children}</AppContent>
        </AppShell>
    );
}
