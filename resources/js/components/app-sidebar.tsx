'use client';

import {
    ChefHat,
    Frame,
    GalleryVerticalEnd,
    Home,
    Map,
    PieChart,
    ShoppingBag,
    Users,
} from 'lucide-react';
import * as React from 'react';

import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { NavMain } from '@/components/nav-main';
// import { NavProjects } from "@/components/nav-projects"
import AppLogoIcon from '@/components/app-logo-icon';
import { NavUser } from '@/components/nav-user';
// import { TeamSwitcher } from '@/components/team-switcher';
import { SheetHeader } from '@/components/ui/sheet';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarRail,
} from '@/components/ui/sidebar';

// This is sample data.
const data = {
    user: {
        name: 'shadcn',
        email: 'm@example.com',
        avatar: '/avatars/shadcn.jpg',
    },
    teams: [
        {
            name: 'Acme Inc',
            logo: GalleryVerticalEnd,
            plan: 'Enterprise',
        },
        // {
        //     name: 'Acme Corp.',
        //     logo: AudioWaveform,
        //     plan: 'Startup',
        // },
        // {
        //     name: 'Evil Corp.',
        //     logo: Command,
        //     plan: 'Free',
        // },
    ],
    navMain: [
        {
            title: 'Dashboard',
            url: '/dashboard',
            icon: Home,
        },
        {
            title: 'Products',
            url: '#',
            icon: ChefHat,
            isActive: true,
            items: [
                {
                    title: 'Categories',
                    url: '/category',
                },
                {
                    title: 'Products',
                    url: '/product',
                },
            ],
        },
        {
            title: 'Orders',
            url: '#',
            icon: ShoppingBag,
            items: [
                // {
                //     title: 'Casshiers',
                //     url: '/casshier',
                // },
                {
                    title: 'Orders',
                    url: '/order',
                },
            ],
        },
        {
            title: 'Users',
            url: '#',
            icon: Users,
            items: [
                {
                    title: 'Admins',
                    url: '/admin',
                },
            ],
        },
        // {
        //     title: 'Settings',
        //     url: '#',
        //     icon: Settings2,
        //     items: [
        //         {
        //             title: 'General',
        //             url: '#',
        //         },
        //         {
        //             title: 'Team',
        //             url: '#',
        //         },
        //         {
        //             title: 'Billing',
        //             url: '#',
        //         },
        //         {
        //             title: 'Limits',
        //             url: '#',
        //         },
        //     ],
        // },
    ],
    projects: [
        {
            name: 'Design Engineering',
            url: '#',
            icon: Frame,
        },
        {
            name: 'Sales & Marketing',
            url: '#',
            icon: PieChart,
        },
        {
            name: 'Travel',
            url: '#',
            icon: Map,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            {/* <SidebarHeader className="flex justify-start text-left"> */}
            {/* <TeamSwitcher teams={data.teams} /> */}
            {/* <div> */}
            {/* <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" /> */}
            {/* </div> */}
            {/* </SidebarHeader> */}
            <SheetHeader className="flex justify-start text-left">
                <AppLogoIcon className="w-12" />
            </SheetHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                {/* <NavProjects projects={data.projects} /> */}
            </SidebarContent>
            <SidebarFooter>
                <div className="flex items-center justify-between px-2 py-1 text-sm font-medium text-sidebar-foreground">
                    <span>Tema</span>
                    <AppearanceToggleDropdown />
                </div>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
