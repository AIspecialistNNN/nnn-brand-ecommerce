# NNN BRAND — "Less Noise. More Identity."

Premium contemporary men's fashion 3D e-commerce platform built with **Next.js (App Router)**, **React 18**, **TypeScript**, **Tailwind CSS**, **Three.js**, and **React Three Fiber**, tailored for the **Uzbekistan** market.

---

## Quick Start

Double-click `start-nnn-brand.bat` or run in terminal:

```powershell
$env:Path = "C:\Users\User\.local\node;" + $env:Path
npm.cmd run dev
```

Open **http://localhost:3000** in your browser.

---

## 10 Implemented Pages & Core Features

1. **Homepage (`/`)** — Editorial hero, live interactive 3D studio showcase, New Arrivals, Featured Collections, Best Sellers, Brand Manifesto.
2. **Shop / Catalog (`/shop`)** — Category, Size (`XS`–`XL`), `3D Only`, Search, and Price (`UZS`) sorting filters.
3. **Product Detail (`/product/[slug]`)** — Real-time **3D Viewer** (Three.js / R3F with mouse/touch 360° orbit, polar camera limits, zoom, wireframe, studio lighting presets, fullscreen, `.GLB` file upload & `.GLB` export), **360° Studio Sequence Viewer** (with automatic fallback when `has3dModel` is disabled, e.g., `/product/storm-shield-gabardine-trench`), **Editorial Gallery**, live Color & Size stock validation, and **Size Guide Modal**.
4. **Shopping Cart (`/cart`)** — Line-item stock validation, promo code engine (`NNN10`, `MONOLITH300`, `TASHKENTVIP`), and shipping estimator.
5. **Checkout (`/checkout`)** — Uzbekistan `+998` phone validation, region/district selector, VIP Tashkent Express / Regional Courier / Showroom Pickup, **Click / Payme / Cash on Delivery** state machine with transparent Sandbox Payment Verification, and **Telegram Bot order notification** logging.
6. **Wishlist (`/wishlist`)** — Saved garments archive.
7. **About Brand (`/about`)** — Architectural manifesto & textile philosophy.
8. **Contact (`/contact`)** — Tashkent Flagship Showroom details & VIP fitting appointment form.
9. **Customer Account (`/account`)** — Client login (`javohir@client.uz` demo or register with `+998`) & live Order History.
10. **Admin Dashboard (`/admin`)** — Protected backoffice (`admin@nnnbrand.uz` / `NNNAdmin2026!`) for Sales Analytics, Products CRUD, 3D & 360° Assets Studio, Inventory Matrix, Orders, Categories, Promotions, and Customers.
