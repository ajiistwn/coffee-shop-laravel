import AppLayoutTemplate from '@/layouts/app/app-header-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    cartCount?: number;
}

export default ({
    children,
    breadcrumbs,
    cartCount,
    ...props
}: AppLayoutProps) => (
    <AppLayoutTemplate
        breadcrumbs={breadcrumbs}
        cartCount={cartCount}
        {...props}
    >
        {children}
    </AppLayoutTemplate>
);
