import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CreditCard,
    Headphones,
    LayoutDashboard,
    Loader2,
    Lock,
    LogIn,
    Mail,
    MapPin,
    Moon,
    PackageSearch,
    Phone,
    Search,
    Shield,
    Store,
    Sun,
    Truck,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import FlashAlert from '@/components/flash-alert';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import type { Auth, Product } from '@/types';

export default function ShopLayout({ children }: PropsWithChildren) {
    const page = usePage<{
        auth: Auth;
        filters?: { search?: string | null };
    }>();
    const { auth, filters } = page.props;
    const user = auth?.user;
    const isAdmin = auth?.roles?.includes('admin');
    const isShopOwner = auth?.roles?.includes('shop_owner');
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const [search, setSearch] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const pathname = window.location.pathname;
            const isProductCatalog = pathname === '/' || pathname.startsWith('/categories');
            if (isProductCatalog) {
                return (
                    new URLSearchParams(window.location.search).get('search') ??
                    filters?.search ??
                    ''
                );
            }
        }
        return '';
    });

    const [liveResults, setLiveResults] = useState<Product[]>([]);
    const [totalLiveResults, setTotalLiveResults] = useState<number>(0);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
        const isProductCatalog = pathname === '/' || pathname.startsWith('/categories');

        if (isProductCatalog) {
            const urlParams = new URLSearchParams(window.location.search);
            const querySearch = urlParams.get('search') ?? filters?.search ?? '';
            setSearch(querySearch);
        } else {
            setSearch('');
            setLiveResults([]);
            setTotalLiveResults(0);
            setIsDropdownOpen(false);
        }
    }, [page.url, filters?.search]);

    // Live autocomplete debounce search
    useEffect(() => {
        const query = search.trim();
        if (query.length < 1) {
            setLiveResults([]);
            setTotalLiveResults(0);
            setIsSearching(false);
            setIsDropdownOpen(false);
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(
                    `/search/live?q=${encodeURIComponent(query)}`,
                    {
                        headers: {
                            Accept: 'application/json',
                        },
                    },
                );
                if (response.ok) {
                    const data = await response.json();
                    setLiveResults(data.products || []);
                    setTotalLiveResults(data.total || 0);
                    setIsDropdownOpen(true);
                }
            } catch {
                // Ignore silent fetch aborts
            } finally {
                setIsSearching(false);
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [search]);

    // Close live search dropdown when clicking outside or pressing Escape
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(e.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleNavSearch = (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        setIsDropdownOpen(false);
        const trimmed = search.trim();
        const currentPath = window.location.pathname;
        const targetPath = currentPath.startsWith('/categories/')
            ? currentPath
            : '/';

        router.get(targetPath, trimmed ? { search: trimmed } : {}, {
            preserveState: targetPath === currentPath,
            preserveScroll: targetPath === currentPath,
        });
    };

    const handleClearSearch = () => {
        setSearch('');
        setLiveResults([]);
        setTotalLiveResults(0);
        setIsDropdownOpen(false);
        const currentPath = window.location.pathname;
        const isProductCatalog = currentPath === '/' || currentPath.startsWith('/categories');
        if (isProductCatalog) {
            router.get(
                currentPath,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }
    };

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
            {/* 1. Very Top Utility Announcement Bar */}
            <div className="hidden sm:block border-b bg-muted/60 px-4 py-1.5 text-xs text-muted-foreground">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    <div className="flex items-center gap-2 truncate text-[11px] sm:text-xs">
                        <span>
                            Free Express Delivery on Orders Over $50 &bull; 100%
                            Authentic Products
                        </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 text-[11px] text-muted-foreground sm:text-xs">
                        <span className="font-medium text-foreground">
                            24/7 Support: +390 0444 149 7243
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Main Storefront Header */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 shadow-xs backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
                    {/* Brand Logo & Name */}
                    <div className="flex shrink-0 items-center gap-6">
                        <Link
                            href="/"
                            className="group flex shrink-0 items-center gap-2 sm:gap-2.5 transition"
                        >
                            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-card p-1 shadow-xs ring-1 ring-border transition group-hover:scale-105 group-hover:ring-primary/40">
                                <AppLogoIcon className="h-full w-full" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold tracking-tight sm:text-lg whitespace-nowrap">
                                    CSN <span className="hidden min-[420px]:inline text-primary">Bangladesh</span>
                                </span>
                            </div>
                        </Link>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex items-center gap-4 text-xs font-medium">
                            <Link
                                href="/"
                                className="text-muted-foreground hover:text-foreground transition"
                            >
                                All Products
                            </Link>
                            <Link
                                href="/shops"
                                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition"
                            >
                                <Store className="h-3.5 w-3.5 text-primary" />
                                Explore Shops
                            </Link>
                        </nav>
                    </div>

                    {/* Global Search Bar - Always on Nav */}
                    <form
                        onSubmit={handleNavSearch}
                        className="relative mx-1.5 flex max-w-xl flex-1 sm:mx-6"
                    >
                        <div
                            ref={searchContainerRef}
                            className="relative w-full"
                        >
                            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground sm:left-3.5" />
                            <input
                                type="text"
                                autoComplete="off"
                                spellCheck={false}
                                value={search}
                                onFocus={() => {
                                    if (search.trim().length >= 1) {
                                        setIsDropdownOpen(true);
                                    }
                                }}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="h-9 sm:h-10 w-full rounded-full border border-input bg-muted/50 pr-8 pl-9 sm:pr-9 sm:pl-10 text-xs transition placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-hidden sm:text-sm [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                            />
                            {isSearching ? (
                                <Loader2 className="absolute top-1/2 right-2.5 sm:right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                            ) : search ? (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute top-1/2 right-2.5 sm:right-3 -translate-y-1/2 cursor-pointer p-0.5 text-muted-foreground hover:text-foreground"
                                    aria-label="Clear search"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            ) : null}

                            {/* Live Search Autocomplete Popover */}
                            {isDropdownOpen && search.trim().length >= 1 && (
                                <>
                                    {/* Mobile Backdrop Overlay */}
                                    <div
                                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
                                        onClick={() => setIsDropdownOpen(false)}
                                        onTouchStart={() => setIsDropdownOpen(false)}
                                        aria-hidden="true"
                                    />

                                    <div className="fixed inset-x-3 top-[4.25rem] z-50 mt-1 max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-2xl border border-border bg-popover/98 p-2 shadow-2xl backdrop-blur-md duration-150 animate-in fade-in-50 zoom-in-95 md:absolute md:inset-x-0 md:top-full md:mt-2 md:max-h-[30rem]">
                                        {isSearching && liveResults.length === 0 ? (
                                            <div className="flex items-center justify-center gap-2.5 py-8 text-sm text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                <span>
                                                    Searching products for &ldquo;{search}&rdquo;...
                                                </span>
                                            </div>
                                        ) : liveResults.length > 0 ? (
                                            <div className="flex flex-col">
                                                <div className="flex items-center justify-between border-b border-border/40 px-3 py-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                    <span>Products</span>
                                                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground">
                                                        {totalLiveResults}{' '}
                                                        {totalLiveResults === 1
                                                            ? 'match'
                                                            : 'matches'}
                                                    </span>
                                                </div>

                                                <div className="divide-y divide-border/40">
                                                    {liveResults.map((product) => {
                                                        const itemAny = product as any;
                                                        const shop = itemAny.shop;
                                                        const prod = itemAny.product ?? product;
                                                        const oldPriceNum =
                                                            (itemAny.old_price ?? product.old_price) !== null
                                                                ? Number(itemAny.old_price ?? product.old_price)
                                                                : null;
                                                        const newPriceNum = Number(
                                                            itemAny.price ?? product.new_price,
                                                        );
                                                        const hasDiscount =
                                                            oldPriceNum !== null &&
                                                            oldPriceNum > newPriceNum;
                                                        const productUrl = shop && prod?.slug
                                                            ? `/shops/${shop.slug}/products/${prod.slug}`
                                                            : `/products/${prod?.slug ?? product.slug}`;

                                                        return (
                                                            <Link
                                                                key={itemAny.id}
                                                                href={productUrl}
                                                                onClick={() =>
                                                                    setIsDropdownOpen(
                                                                        false,
                                                                    )
                                                                }
                                                                className="group flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-accent/80 active:bg-accent"
                                                            >
                                                                <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-muted/40">
                                                                    <img
                                                                        src={
                                                                            itemAny.thumbnail_url ??
                                                                            product.image_url
                                                                        }
                                                                        alt={
                                                                            prod?.name ?? product.name
                                                                        }
                                                                        className="h-full w-full object-cover object-center transition duration-200 group-hover:scale-105"
                                                                        loading="lazy"
                                                                    />
                                                                </div>

                                                                <div className="flex min-w-0 flex-1 flex-col justify-center">
                                                                    <p className="truncate text-xs sm:text-sm font-semibold text-foreground transition group-hover:text-primary">
                                                                        {prod?.name ?? product.name}
                                                                    </p>
                                                                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                                        {shop && (
                                                                            <span className="flex min-w-0 items-center gap-1 truncate">
                                                                                <Store className="h-3 w-3 shrink-0 text-primary" />
                                                                                <span className="truncate">{shop.name}</span>
                                                                            </span>
                                                                        )}
                                                                        {prod?.category && (
                                                                            <>
                                                                                <span className="text-muted-foreground/40">•</span>
                                                                                <span className="shrink-0">{prod.category.name}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="shrink-0 pl-2 text-right">
                                                                    <span className="text-xs sm:text-sm font-bold text-foreground">
                                                                        $
                                                                        {newPriceNum.toFixed(
                                                                            2,
                                                                        )}
                                                                    </span>
                                                                    {hasDiscount &&
                                                                        oldPriceNum !==
                                                                            null && (
                                                                            <span className="block text-[10px] sm:text-[11px] text-muted-foreground line-through">
                                                                                $
                                                                                {oldPriceNum.toFixed(
                                                                                    2,
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                </div>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>

                                                {totalLiveResults > 0 && (
                                                    <div className="border-t border-border/50 p-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={handleNavSearch}
                                                            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-muted/60 py-2 text-xs font-medium text-foreground transition hover:bg-primary hover:text-primary-foreground active:scale-[0.99]"
                                                        >
                                                            <Search className="h-3.5 w-3.5" />
                                                            <span>
                                                                View all {totalLiveResults} result{totalLiveResults === 1 ? '' : 's'} for &ldquo;{search}&rdquo;
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                                    <PackageSearch className="h-5 w-5" />
                                                </div>
                                                <p className="mt-2.5 text-xs sm:text-sm font-semibold text-foreground">
                                                    No products found for &ldquo;{search}&rdquo;
                                                </p>
                                                <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground">
                                                    Try checking your spelling or searching for a different keyword.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </form>

                    {/* Nav Right Actions */}
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        {/* Dark / Light Mode Toggle */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="text h-9 w-9 rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            aria-label={
                                resolvedAppearance === 'dark'
                                    ? 'Switch to light mode'
                                    : 'Switch to dark mode'
                            }
                            title={
                                resolvedAppearance === 'dark'
                                    ? 'Switch to light mode'
                                    : 'Switch to dark mode'
                            }
                        >
                            {resolvedAppearance === 'dark' ? (
                                <Sun className="h-4 w-4 text-foreground transition-transform duration-300 hover:rotate-45" />
                            ) : (
                                <Moon className="h-4 w-4 text-slate-700 transition-transform duration-300 hover:-rotate-12 dark:text-slate-200" />
                            )}
                        </Button>

                        {isAdmin ? (
                            <Button
                                asChild
                                size="sm"
                                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                <Link href="/admin/dashboard">
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Admin Dashboard
                                    </span>
                                    <span className="sm:hidden">Admin</span>
                                </Link>
                            </Button>
                        ) : isShopOwner ? (
                            <Button
                                asChild
                                size="sm"
                                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                <Link href="/owner/products">
                                    <Store className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Manage My Shop
                                    </span>
                                    <span className="sm:hidden">My Shop</span>
                                </Link>
                            </Button>
                        ) : !user ? (
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-xs font-semibold"
                            >
                                <Link href="/login">
                                    <LogIn className="h-4 w-4" />
                                    <span>Sign In</span>
                                </Link>
                            </Button>
                        ) : null}
                    </div>
                </div>
            </header>

            {/* 3. Main Content Area */}
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
                <FlashAlert />
                {children}
            </main>

            {/* 4. Standard Professional E-Commerce Footer */}
            <footer className="mt-16 border-t bg-muted/40 text-foreground">
                {/* Feature Highlights Bar */}
                <div className="border-b border-border/50 bg-background/50 py-6">
                    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Truck className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold tracking-wider uppercase">
                                    Fast Shipping
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    Nationwide delivery
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold tracking-wider uppercase">
                                    Authentic Products
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    100% genuine quality
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold tracking-wider uppercase">
                                    Secure Payment
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    Encrypted transactions
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Headphones className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold tracking-wider uppercase">
                                    Customer Support
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    Dedicated assistance
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Multi-Column Links */}
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
                        {/* Column 1: Brand Info (Spans 2 on lg) */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card p-1 shadow-xs ring-1 ring-border">
                                    <AppLogoIcon className="h-full w-full" />
                                </div>
                                <span className="text-lg font-bold tracking-tight">
                                    CSN{' '}
                                    <span className="text-primary">Bangladesh</span>
                                </span>
                            </div>
                            <p className="mt-3 max-w-sm text-xs leading-relaxed text-muted-foreground">
                                CSN Bangladesh is a premier multi-vendor
                                e-commerce platform offering top-tier
                                electronics, fashion apparel, and home
                                appliances with effortless browsing.
                            </p>

                            <div className="mt-5 flex flex-col gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                                    <span>
                                        Dhaka, Bangladesh
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                                    <span>support@csnbangladesh.com</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
                                    <span>+390 0444 149 7243</span>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Categories */}
                        <div>
                            <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">
                                Top Categories
                            </h3>
                            <ul className="mt-4 space-y-2.5 text-xs text-muted-foreground">
                                <li>
                                    <Link
                                        href="/categories/electronics"
                                        className="transition hover:text-primary"
                                    >
                                        Electronics & Gadgets
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/categories/fashion-apparel"
                                        className="transition hover:text-primary"
                                    >
                                        Fashion & Apparel
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/categories/home-appliances"
                                        className="transition hover:text-primary"
                                    >
                                        Home & Kitchen Appliances
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/"
                                        className="transition hover:text-primary"
                                    >
                                        All Products
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: Customer Care */}
                        <div>
                            <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">
                                Customer Care
                            </h3>
                            <ul className="mt-4 space-y-2.5 text-xs text-muted-foreground">
                                <li>
                                    <span className="cursor-pointer transition hover:text-primary">
                                        Help & FAQ Center
                                    </span>
                                </li>
                                <li>
                                    <span className="cursor-pointer transition hover:text-primary">
                                        Shipping & Delivery
                                    </span>
                                </li>
                                <li>
                                    <span className="cursor-pointer transition hover:text-primary">
                                        Warranty & Return Policy
                                    </span>
                                </li>
                                <li>
                                    <span className="cursor-pointer transition hover:text-primary">
                                        Terms & Conditions
                                    </span>
                                </li>
                                <li>
                                    <Link
                                        href={
                                            isAdmin
                                                ? '/admin/dashboard'
                                                : '/login'
                                        }
                                        className="font-medium text-primary hover:underline"
                                    >
                                        {isAdmin
                                            ? 'Admin Dashboard'
                                            : 'Admin Portal Login'}
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 4: Newsletter & Security */}
                        <div>
                            <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">
                                Newsletter
                            </h3>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Subscribe for exclusive discounts, new arrivals,
                                and store updates.
                            </p>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    alert(
                                        'Thank you for subscribing to CSN Bangladesh updates!',
                                    );
                                }}
                                className="mt-3 flex flex-col gap-2"
                            >
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="w-full gap-1.5 text-xs font-semibold"
                                >
                                    <span>Subscribe</span>
                                    <ArrowRight className="h-3 w-3" />
                                </Button>
                            </form>
                            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <Lock className="h-3 w-3 text-primary" />
                                <span>SSL Secure checkout</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Copyright and Trust Badges */}
                    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
                        <div>
                            &copy;{' '}
                            <span className="font-semibold text-foreground">
                                CSN Bangladesh
                            </span>
                            {'  '}
                            {new Date().getFullYear()}
                            {'  '}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="mr-1 text-[11px] font-medium text-muted-foreground">
                                We Accept:
                            </span>
                            <img
                                src="/images/payments/visa.svg"
                                alt="Visa"
                                className="h-6 w-auto rounded shadow-xs transition hover:opacity-90"
                                title="Visa"
                            />
                            <img
                                src="/images/payments/mastercard.svg"
                                alt="Mastercard"
                                className="h-6 w-auto rounded shadow-xs transition hover:opacity-90"
                                title="Mastercard"
                            />
                            <img
                                src="/images/payments/bkash.svg"
                                alt="bKash"
                                className="h-6 w-auto rounded shadow-xs transition hover:opacity-90"
                                title="bKash"
                            />
                            <img
                                src="/images/payments/nagad.svg"
                                alt="Nagad"
                                className="h-6 w-auto rounded shadow-xs transition hover:opacity-90"
                                title="Nagad"
                            />
                            <img
                                src="/images/payments/cod.svg"
                                alt="Cash on Delivery"
                                className="h-6 w-auto rounded shadow-xs transition hover:opacity-90"
                                title="Cash on Delivery"
                            />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
