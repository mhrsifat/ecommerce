# Small E-Commerce Management System

A multi-vendor e-commerce and shared product catalog management platform built for the **Technical Assessment: Backend Developer (PHP, Laravel)** at **CSN Bangladesh Limited**.

Built with **Laravel 12**, **Inertia.js v3**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Spatie Laravel Permission**.

---

## Task Overview & Functional Requirements

The system enables administrators to manage shops and a shared product catalog, while independent shop owners manage their individual storefront listings using that catalog.

| Area | Requirements Fulfilled |
| :--- | :--- |
| **Admin Panel** | &bull; Admin authentication with role enforcement (`role:admin`)<br>&bull; **Shop Management (CRUD)**: Create, view, update, delete shops, assign owners, upload logos<br>&bull; **Product Management (CRUD)**: Manage the shared catalog available to all merchants<br>&bull; **Shop Owner Accounts**: Create, update, delete shop owner accounts (`role:shop_owner`) with optional automatic shop creation |
| **Shop Management** | &bull; **Browse Shared Catalog**: Shop owners browse all catalog products (created by admin or other merchants)<br>&bull; **Add to Shop**: Select catalog products and list them in their shop<br>&bull; **Custom Pricing & Details**: Set shop-specific prices, original discount prices, custom marketing/warranty details, and custom thumbnails<br>&bull; **Merchant Product Creation**: Shop owners can create new products which are automatically added to their shop **and** become available in the shared catalog for all other shop owners<br>&bull; **Shop Profile**: Update store name, bio, logo, email, phone, and address |
| **Customer View** | &bull; **Shop-Assigned Only**: Customers strictly only see products assigned to active shops<br>&bull; **Shop-Specific Details**: Storefront displays shop-specific selling prices, discounts, custom descriptions, and custom thumbnails<br>&bull; **Strict Isolation**: Products not assigned to any shop are **never visible** to customers (excluded from homepage, category browsing, live search, and return 404 on direct URLs)<br>&bull; **Shop Directory & Storefronts**: Dedicated shop directory (`/shops`) and individual shop pages (`/shops/{slug}`) |

---

## System Architecture

```
                    ┌───────────────────────────────────┐
                    │       Shared Product Catalog      │
                    │   (Created by Admin & Merchants)  │
                    └─────────────────┬─────────────────┘
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            ▼                                                   ▼
┌─────────────────────────┐                           ┌─────────────────────────┐
│     TechWorld Dhaka     │                           │     Prime Gadget Hub    │
│  (Owner: Rahim Ahmed)   │                           │  (Owner: Kamal Hossain) │
├─────────────────────────┤                           ├─────────────────────────┤
│ Product: Flagship Phone │                           │ Product: Flagship Phone │
│ Shop Price: $899.99     │                           │ Shop Price: $925.00     │
│ Warranty: 1-Year Official│                          │ Warranty: Priority 24/7 │
│ Custom Thumbnail: Yes   │                           │ Custom Thumbnail: No    │
└───────────┬─────────────┘                           └───────────┬─────────────┘
            │                                                     │
            └─────────────────────────┬───────────────────────────┘
                                      ▼
                    ┌───────────────────────────────────┐
                    │        Customer Storefront        │
                    │ Only shows shop-assigned listings │
                    │ Displays shop price & thumbnails  │
                    └───────────────────────────────────┘
```

---

## Seeded Demo Credentials

Run `php artisan migrate:fresh --seed` to automatically populate these roles, accounts, shops, and catalog products:

### 1. Administrator Accounts
| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@admin.com` | `password` | `/admin/dashboard` |
| **Admin (Alternative)** | `admin@csnbangladesh.com` | `password` | `/admin/dashboard` |

### 2. Shop Owner Accounts
| Shop Owner | Email | Password | Assigned Shop | Storefront URL |
| :--- | :--- | :--- | :--- | :--- |
| **Rahim Ahmed** | `rahim@shop.com` | `password` | TechWorld Dhaka | `/shops/techworld-dhaka` |
| **Fatima Zahra** | `fatima@shop.com` | `password` | Elegance Fashion Boutique | `/shops/elegance-fashion-boutique` |
| **Kamal Hossain** | `kamal@shop.com` | `password` | Prime Gadget Hub | `/shops/prime-gadget-hub` |

---

## Local Setup Instructions (Fresh Setup)

Follow these simple steps to run the project locally from scratch:

### 1. Clone the Repository
```bash
git clone https://github.com/mhrsifat/simple-ecommerce.git
cd simple-ecommerce
```

### 2. Install PHP Dependencies
```bash
composer install
```

### 3. Setup Environment File
```bash
cp .env.example .env
```
Ensure your database credentials in `.env` are configured (e.g. MySQL or SQLite):
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=simple_ecommerce
DB_USERNAME=root
DB_PASSWORD=
```
*(Or use SQLite: set `DB_CONNECTION=sqlite` and create `database/database.sqlite`)*

### 4. Generate Application Key
```bash
php artisan key:generate
```

### 5. Link Public Storage
Required for uploading and serving shop logos and product thumbnails:
```bash
php artisan storage:link
```

### 6. Run Migrations & Seeders
Populates roles, permissions, categories, initial shops, and demo catalog items:
```bash
php artisan migrate:fresh --seed
```

### 7. Install & Build Frontend Assets
```bash
npm install
npm run build
```
*(Or run `npm run dev` for live Hot Module Replacement during development)*

### 8. Start the Local Server
```bash
php artisan serve
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

---

## Feature Verification Walkthrough

### 1. Admin Panel (`/admin`)
1. Log in as `admin@admin.com` / `password`.
2. **Dashboard** (`/admin/dashboard`): Overview of registered shops, shop owners, shared catalog items, and active listings.
3. **Shop Management** (`/admin/shops`):
   - View, search, and paginate all shops.
   - Click **Add New Shop** to create a shop, assign a shop owner, and upload a store logo.
   - Edit store details, reassign ownership, or delete shops.
4. **Shop Owner Accounts** (`/admin/shop-owners`):
   - Create new shop owner accounts with name, email, and password.
   - Optionally specify an initial store name to automatically provision their shop.
5. **Products** (`/admin/products`):
   - Manage base catalog items. See which administrator or merchant authored each item and how many shops currently list it.

### 2. Shop Management (`/owner`)
1. Log in as `rahim@shop.com` / `password`.
2. You will be automatically redirected to your **Shop Products** management (`/owner/products`).
3. **Browse Shared Catalog** (`/owner/catalog`):
   - Browse catalog products created by admin and other merchants (e.g. Fatima).
   - Click **Add to My Shop** on any item: set your own custom shop price (e.g. $89.99), custom warranty details, and upload a custom thumbnail.
4. **Create New Product** (`/owner/products`):
   - Click **Create New Product**.
   - Fill in details and upload an image.
   - The product is immediately added to your shop **and** added to the shared catalog so other shop owners can also list it!
5. **Manage My Products** (`/owner/products`):
   - Edit selling prices, original prices, stock levels, or custom thumbnails.
   - Click **Unlist**: removes the item from your shop without deleting it from the shared catalog.
6. **Shop Settings** (`/owner/shop`):
   - Update your shop name, store bio, phone, address, and upload your shop logo.

### 3. Customer Storefront (`/`)
1. Visit **[http://localhost:8000](http://localhost:8000)** as a customer (no login required).
2. **Shop-Assigned Products Only**:
   - Every product card displays the badge `"Sold by [Shop Name]"`.
   - Prices, discounts, and thumbnails reflect the shop-specific overrides.
3. **Unassigned Product Isolation**:
   - The catalog contains an unassigned product seeded as `"Unassigned Prototype Drone 4K"`.
   - Search for "Drone" or "Prototype": **0 results found**.
   - Directly visit `/products/unassigned-prototype-drone-4k`: returns a graceful 404 message informing the customer that the product is not available in any active shop.
4. **Shop Directory** (`/shops`):
   - Browse all verified shops, see how many products each has, and visit individual storefronts (`/shops/{shop:slug}`).
5. **Price & Offer Comparison**:
   - View a product listed by multiple shops (e.g. `/shops/techworld-dhaka/products/flagship-pro-smartphone-256gb`).
   - The page displays the specific shop price ($899.99) and warranty, and highlights other shops selling the same item with their prices.

---

## Automated Test Suite

The project includes **61 automated feature and unit tests** covering authentication, shop management CRUD, shop owner account administration, shared catalog importing, merchant product creation, customer isolation, and storefront views:

```bash
# Run the full test suite
php artisan test
```

### Run Code Formatting & Static Analysis
```bash
# Auto-fix code style with Laravel Pint
./vendor/bin/pint

# Run PHPStan static analysis (Level 5)
./vendor/bin/phpstan analyse --memory-limit=512M

# Run complete CI check pipeline
composer ci:check
```

---

## Tech Stack Summary
- **Backend**: Laravel 12 (PHP 8.2+)
- **Authentication & RBAC**: Laravel Fortify + Spatie Laravel Permission
- **Frontend SPA**: Inertia.js v3 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Radix UI Primitives + Lucide Icons
- **Testing**: Pest PHP & PHPUnit
- **Code Quality**: Laravel Pint & PHPStan (Larastan)
