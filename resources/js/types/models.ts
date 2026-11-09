import type { User } from './auth';

export type Flash = {
    success?: string | null;
    error?: string | null;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

export type Category = {
    id: number;
    name: string;
    slug: string;
    path?: string;
    subcategories_count?: number;
    products_count?: number;
    subcategories?: Subcategory[];
    products?: Product[];
    created_at?: string;
};

export type Subcategory = {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    path?: string;
    category?: Category;
    products_count?: number;
    products?: Product[];
    created_at?: string;
};

export type Shop = {
    id: number;
    user_id: number;
    name: string;
    slug: string;
    description?: string | null;
    logo?: string | null;
    logo_url?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    is_active: boolean;
    owner?: User;
    products_count?: number;
    shop_products_count?: number;
    created_at?: string;
};

export type Product = {
    id: number;
    category_id: number;
    subcategory_id: number;
    created_by_id?: number | null;
    name: string;
    slug: string;
    description: string;
    image: string;
    image_url: string;
    path?: string;
    old_price: string | number | null;
    new_price: string | number;
    category?: Category;
    subcategory?: Subcategory;
    creator?: User;
    shop_products_count?: number;
    is_in_shop?: boolean;
    shop_product?: ShopProduct | null;
    created_at?: string;
};

export type ShopProduct = {
    id: number;
    shop_id: number;
    product_id: number;
    price: string | number;
    old_price?: string | number | null;
    details?: string | null;
    display_details?: string;
    thumbnail?: string | null;
    thumbnail_url: string;
    stock: number;
    is_active: boolean;
    discount_percentage?: number | null;
    shop?: Shop;
    product?: Product;
    created_at?: string;
};
