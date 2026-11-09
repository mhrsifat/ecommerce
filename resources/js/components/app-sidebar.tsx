import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    FolderTree,
    Globe,
    Layers,
    LayoutDashboard,
    Package,
    PackageCheck,
    Store,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { Auth, NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage<{ auth: Auth }>();
    const roles = page.props.auth?.roles ?? [];
    const isAdmin = roles.includes('admin');
    const isShopOwner = roles.includes('shop_owner');

    const adminNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
            icon: LayoutDashboard,
        },
        {
            title: 'Shops',
            href: '/admin/shops',
            icon: Store,
        },
        {
            title: 'Shop Owners',
            href: '/admin/shop-owners',
            icon: Users,
        },
        {
            title: 'Shared Product Catalog',
            href: '/admin/products',
            icon: Package,
        },
        {
            title: 'Categories',
            href: '/admin/categories',
            icon: FolderTree,
        },
        {
            title: 'Subcategories',
            href: '/admin/subcategories',
            icon: Layers,
        },
        {
            title: 'View Storefront',
            href: '/',
            icon: Globe,
        },
    ];

    const ownerNavItems: NavItem[] = [
        {
            title: 'My Shop Products',
            href: '/owner/products',
            icon: PackageCheck,
        },
        {
            title: 'Shared Catalog',
            href: '/owner/catalog',
            icon: BookOpen,
        },
        {
            title: 'Shop Settings',
            href: '/owner/shop',
            icon: Store,
        },
        {
            title: 'View Storefront',
            href: '/',
            icon: Globe,
        },
    ];

    const navItems = isAdmin ? adminNavItems : isShopOwner ? ownerNavItems : adminNavItems;
    const homeHref = isAdmin ? '/admin/dashboard' : isShopOwner ? '/owner/products' : '/';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
