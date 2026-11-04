"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  BarChart3,
  Box,
  FolderKanban,
  Layers,
  Lock,
  LogOut,
  Package,
  Plus,
  RotateCw,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { formatUzs } from "@/lib/i18n";
import { GarmentArchetype, OrderStatus, SizeCode } from "@/lib/types";

const Product3DViewer = dynamic(
  () => import("@/components/viewer/Product3DViewer"),
  { ssr: false }
);

type AdminTab =
  | "ANALYTICS"
  | "PRODUCTS"
  | "CATEGORIES"
  | "ORDERS"
  | "INVENTORY"
  | "ASSETS_3D_360"
  | "PROMOTIONS"
  | "CUSTOMERS";

export default function AdminDashboardPage() {
  const {
    products,
    categories,
    orders,
    discounts,
    users,
    inquiries,
    adminToken,
    setAdminToken,
    refreshStore,
  } = useStore();

  const [email, setEmail] = useState("admin@nnnbrand.uz");
  const [password, setPassword] = useState("NNNAdmin2026!");
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("ANALYTICS");
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // New Product State
  const [newProdNameUz, setNewProdNameUz] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("2490000");
  const [newProdCategoryId, setNewProdCategoryId] = useState("cat-outerwear");
  const [newProdArchetype, setNewProdArchetype] =
    useState<GarmentArchetype>("overcoat");
  const [newProdFabric, setNewProdFabric] = useState(
    "100% Italiya Virgin Juni (520 GSM)"
  );
  const [newProdImage, setNewProdImage] = useState(
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85"
  );
  const [newProdHas3D, setNewProdHas3D] = useState(true);

  // New Category State
  const [newCatNameUz, setNewCatNameUz] = useState("");
  const [newCatNameEn, setNewCatNameEn] = useState("");
  const [newCatDescUz, setNewCatDescUz] = useState("");

  // New Promo State
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoType, setNewPromoType] = useState<"PERCENTAGE" | "FIXED_UZS">(
    "PERCENTAGE"
  );
  const [newPromoValue, setNewPromoValue] = useState("15");
  const [newPromoMinUzs, setNewPromoMinUzs] = useState("1500000");

  // 3D & 360 Asset Editor State
  const [selectedAssetProductId, setSelectedAssetProductId] = useState<string>(
    products[0]?.id || "prod-monolith-overcoat"
  );
  const [customModelUrlInput, setCustomModelUrlInput] = useState("");
  const [custom360UrlsInput, setCustom360UrlsInput] = useState("");

  const notify = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(null), 3500);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "ADMIN_LOGIN", email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdminToken(data.adminToken);
        return;
      }
    } catch {
      // Static fallback
    }
    if (
      email.trim().toLowerCase() === "admin@nnnbrand.uz" &&
      password === "NNNAdmin2026!"
    ) {
      setAdminToken("NNN_ADMIN_SESSION_TOKEN");
    } else {
      setAuthError("Admin login yoki parol noto'g'ri.");
    }
  };

  const totalRevenueUzs = useMemo(
    () =>
      orders
        .filter((o) => o.status !== "CANCELLED")
        .reduce((sum, o) => sum + o.totalUzs, 0),
    [orders]
  );

  const totalUnitsInStock = useMemo(
    () =>
      products.reduce(
        (sum, p) => sum + p.sizes.reduce((acc, s) => acc + s.stock, 0),
        0
      ),
    [products]
  );

  const selectedAssetProduct =
    products.find((p) => p.id === selectedAssetProductId) || products[0];

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CREATE_PRODUCT",
        adminSecret: adminToken,
        product: {
          nameUz: newProdNameUz,
          nameRu: newProdNameUz,
          nameEn: newProdNameUz,
          sku: newProdSku,
          priceUzs: Number(newProdPrice),
          categoryId: newProdCategoryId,
          garmentArchetype: newProdArchetype,
          fabricUz: newProdFabric,
          gallery: [newProdImage],
          has3dModel: newProdHas3D,
        },
      }),
    });
    if (res.ok) {
      setNewProdNameUz("");
      setNewProdSku("");
      await refreshStore();
      notify("Yangi mahsulot katalogga qo'shildi!");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const res = await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "DELETE_PRODUCT",
        adminSecret: adminToken,
        productId,
      }),
    });
    if (res.ok) {
      await refreshStore();
      notify("Mahsulot o'chirildi.");
    }
  };

  const handleUpdateStock = async (
    productId: string,
    size: SizeCode,
    stock: number
  ) => {
    const res = await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "UPDATE_STOCK",
        adminSecret: adminToken,
        productId,
        size,
        stock,
      }),
    });
    if (res.ok) {
      await refreshStore();
      notify(`Ombor qoldig'i yangilandi (${size}: ${stock} dona)`);
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: OrderStatus
  ) => {
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    if (res.ok) {
      await refreshStore();
      notify(`Buyurtma holati yangilandi: ${status}`);
    }
  };

  const handleVerifyOrderPayment = async (orderId: string) => {
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, action: "VERIFY_SANDBOX_PAYMENT" }),
    });
    if (res.ok) {
      await refreshStore();
      notify("To'lov tasdiqlandi!");
    }
  };

  const handleSave3DAssetConfig = async (
    has3dModel: boolean,
    garmentArchetype: GarmentArchetype
  ) => {
    if (!selectedAssetProduct) return;
    const frames360Urls = custom360UrlsInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "UPDATE_3D_ASSET",
        adminSecret: adminToken,
        productId: selectedAssetProduct.id,
        has3dModel,
        garmentArchetype,
        model3dUrl:
          customModelUrlInput.trim() || selectedAssetProduct.model3dUrl,
        frames360Urls: frames360Urls.length > 0 ? frames360Urls : undefined,
      }),
    });
    if (res.ok) {
      await refreshStore();
      notify("3D va 360° asset sozlamalari saqlandi!");
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CREATE_CATEGORY",
        adminSecret: adminToken,
        category: {
          nameUz: newCatNameUz,
          nameRu: newCatNameUz,
          nameEn: newCatNameEn || newCatNameUz,
          descriptionUz: newCatDescUz,
        },
      }),
    });
    if (res.ok) {
      setNewCatNameUz("");
      setNewCatNameEn("");
      setNewCatDescUz("");
      await refreshStore();
      notify("Yangi kategoriya yaratildi!");
    }
  };

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CREATE_DISCOUNT",
        adminSecret: adminToken,
        discount: {
          code: newPromoCode,
          type: newPromoType,
          value: Number(newPromoValue),
          minOrderUzs: Number(newPromoMinUzs),
        },
      }),
    });
    if (res.ok) {
      setNewPromoCode("");
      await refreshStore();
      notify("Yangi promo-kod qo'shildi!");
    }
  };

  const handleToggleDiscount = async (discountId: string) => {
    const res = await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "TOGGLE_DISCOUNT",
        adminSecret: adminToken,
        discountId,
      }),
    });
    if (res.ok) {
      await refreshStore();
      notify("Promo-kod holati o'zgartirildi.");
    }
  };

  // PROTECTED ADMIN GATE
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F7F7F5] flex items-center justify-center p-4">
        <form
          onSubmit={handleAdminLogin}
          className="bg-[#0E0E10] border border-white/20 max-w-md w-full p-8 space-y-6"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>PROTECTED ROUTE</span>
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-[0.18em] text-white">
              NNN BRAND ADMIN
            </h1>
            <p className="text-xs text-stone">
              Mahsulotlar, 3D/360° modellar, ombor va buyurtmalarni boshqarish
              tizimi.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#141418] border border-white/15 px-3.5 py-3 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone mb-1.5">
                Maxfiy Parol
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#141418] border border-white/15 px-3.5 py-3 text-xs font-mono text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 p-3 text-[11px] font-mono text-stone">
            Demo kirish: admin@nnnbrand.uz / NNNAdmin2026!
          </div>

          {authError && (
            <div className="text-xs text-red-400 border border-red-500/30 bg-red-500/10 p-3">
              {authError}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-white text-black py-3.5 text-xs uppercase tracking-[0.22em] font-semibold hover:bg-ash transition flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Boshqaruv Paneliga Kirish</span>
          </button>
        </form>
      </div>
    );
  }

  const navItems: { id: AdminTab; label: string; icon: any }[] = [
    { id: "ANALYTICS", label: "Sotuv Analitikasi", icon: BarChart3 },
    { id: "PRODUCTS", label: `Mahsulotlar (${products.length})`, icon: ShoppingBag },
    { id: "ASSETS_3D_360", label: "3D & 360° Studio", icon: Box },
    { id: "INVENTORY", label: "Ombor Qoldig'i", icon: Layers },
    { id: "ORDERS", label: `Buyurtmalar (${orders.length})`, icon: Package },
    { id: "CATEGORIES", label: `Kategoriyalar (${categories.length})`, icon: FolderKanban },
    { id: "PROMOTIONS", label: `Promo-kodlar (${discounts.length})`, icon: Tag },
    { id: "CUSTOMERS", label: `Mijozlar (${users.length})`, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F7F7F5] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-stone">
              NNN BRAND ATELIER BACKOFFICE
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-[0.18em] text-white mt-1">
              Admin Boshqaruv Paneli
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {statusBanner && (
              <div className="bg-emerald-500/15 border border-emerald-500/40 px-4 py-2 text-xs text-emerald-300">
                ✓ {statusBanner}
              </div>
            )}
            <button
              type="button"
              onClick={() => setAdminToken(null)}
              className="border border-white/20 px-4 py-2 text-xs uppercase tracking-widest text-ash hover:text-white flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Chiqish</span>
            </button>
          </div>
        </div>

        {/* Module Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2.5 text-xs uppercase tracking-wider border flex items-center gap-2 transition ${
                  active
                    ? "bg-white text-black border-white font-semibold"
                    : "border-white/15 bg-[#0E0E10] text-ash hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. SALES ANALYTICS TAB */}
        {activeTab === "ANALYTICS" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0E0E10] border border-white/10 p-6 space-y-2">
                <span className="text-[11px] uppercase tracking-widest text-stone">
                  Jami Tushum (UZS)
                </span>
                <div className="text-2xl font-mono font-bold text-white">
                  {formatUzs(totalRevenueUzs)}
                </div>
                <span className="text-[11px] text-emerald-400">
                  Faol buyurtmalar: {orders.length} ta
                </span>
              </div>

              <div className="bg-[#0E0E10] border border-white/10 p-6 space-y-2">
                <span className="text-[11px] uppercase tracking-widest text-stone">
                  3D & 360° Modellar
                </span>
                <div className="text-2xl font-mono font-bold text-white">
                  {products.filter((p) => p.has3dModel).length} / {products.length}
                </div>
                <span className="text-[11px] text-ash">
                  100% 360° fallback bilan ta&apos;minlangan
                </span>
              </div>

              <div className="bg-[#0E0E10] border border-white/10 p-6 space-y-2">
                <span className="text-[11px] uppercase tracking-widest text-stone">
                  Ombordagi Jami Zaxira
                </span>
                <div className="text-2xl font-mono font-bold text-white">
                  {totalUnitsInStock} dona
                </div>
                <span className="text-[11px] text-stone">
                  {products.length} ta SKU bo&apos;yicha
                </span>
              </div>

              <div className="bg-[#0E0E10] border border-white/10 p-6 space-y-2">
                <span className="text-[11px] uppercase tracking-widest text-stone">
                  Mijozlar & Murojaatlar
                </span>
                <div className="text-2xl font-mono font-bold text-white">
                  {users.length} mijoz · {inquiries.length} xat
                </div>
                <span className="text-[11px] text-stone">
                  Toshkent va viloyatlar
                </span>
              </div>
            </div>

            {/* Recent Orders Snapshot */}
            <div className="bg-[#0E0E10] border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                  So&apos;nggi Buyurtmalar
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab("ORDERS")}
                  className="text-xs text-ash hover:text-white underline"
                >
                  Barchasini boshqarish →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-stone uppercase">
                      <th className="py-2.5">Raqam</th>
                      <th className="py-2.5">Mijoz</th>
                      <th className="py-2.5">Hudud</th>
                      <th className="py-2.5">To&apos;lov</th>
                      <th className="py-2.5">Holat</th>
                      <th className="py-2.5 text-right">Summa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {orders.slice(0, 6).map((o) => (
                      <tr key={o.id}>
                        <td className="py-3 font-mono font-bold text-white">
                          #{o.orderNumber}
                        </td>
                        <td className="py-3">
                          {o.customerName}{" "}
                          <span className="text-stone font-mono">
                            ({o.customerPhone})
                          </span>
                        </td>
                        <td className="py-3 text-ash">{o.region}</td>
                        <td className="py-3 font-mono text-ash">
                          {o.paymentMethod} ({o.paymentStatus})
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 border border-white/20 text-[10px] font-mono uppercase">
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-white">
                          {formatUzs(o.totalUzs)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. PRODUCTS MANAGEMENT TAB */}
        {activeTab === "PRODUCTS" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Add New Product Form */}
            <form
              onSubmit={handleCreateProduct}
              className="lg:col-span-5 bg-[#0E0E10] border border-white/15 p-6 space-y-4 h-fit"
            >
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white border-b border-white/10 pb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Yangi Mahsulot Qo&apos;shish</span>
              </h2>

              <div>
                <label className="block text-[11px] uppercase text-stone mb-1">
                  Mahsulot Nomi (UZ) *
                </label>
                <input
                  type="text"
                  required
                  value={newProdNameUz}
                  onChange={(e) => setNewProdNameUz(e.target.value)}
                  placeholder="Masalan: VORTEX Jun Kurtka"
                  className="w-full bg-[#141418] border border-white/15 px-3 py-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase text-stone mb-1">
                    SKU Kodi *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    placeholder="NNN-AW26-JK09"
                    className="w-full bg-[#141418] border border-white/15 px-3 py-2.5 text-xs font-mono text-white uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-stone mb-1">
                    Narxi (UZS) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full bg-[#141418] border border-white/15 px-3 py-2.5 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase text-stone mb-1">
                    Kategoriya
                  </label>
                  <select
                    value={newProdCategoryId}
                    onChange={(e) => setNewProdCategoryId(e.target.value)}
                    className="w-full bg-[#141418] border border-white/15 px-3 py-2.5 text-xs text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameUz}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase text-stone mb-1">
                    3D Model Arxetipi
                  </label>
                  <select
                    value={newProdArchetype}
                    onChange={(e) =>
                      setNewProdArchetype(e.target.value as GarmentArchetype)
                    }
                    className="w-full bg-[#141418] border border-white/15 px-3 py-2.5 text-xs text-white"
                  >
                    <option value="overcoat">Overcoat (Palto)</option>
                    <option value="blazer">Blazer (Pijak)</option>
                    <option value="hoodie">Hoodie (Xudi)</option>
                    <option value="overshirt">Overshirt (Kurtka)</option>
                    <option value="trousers">Trousers (Shim)</option>
                    <option value="turtleneck">Mock-Neck Knit</option>
                    <option value="tote">Leather Weekender Tote</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase text-stone mb-1">
                  Mato Tarkibi
                </label>
                <input
                  type="text"
                  value={newProdFabric}
                  onChange={(e) => setNewProdFabric(e.target.value)}
                  className="w-full bg-[#141418] border border-white/15 px-3 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase text-stone mb-1">
                  Asosiy Rasm URL
                </label>
                <input
                  type="url"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full bg-[#141418] border border-white/15 px-3 py-2.5 text-xs text-white"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-ash cursor-pointer">
                <input
                  type="checkbox"
                  checked={newProdHas3D}
                  onChange={(e) => setNewProdHas3D(e.target.checked)}
                  className="accent-white"
                />
                <span>Interaktiv 3D Model yoqilgan (o&apos;chirilsa 360° fallback)</span>
              </label>

              <button
                type="submit"
                className="w-full bg-white text-black py-3.5 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-ash transition"
              >
                Mahsulotni Saqlash
              </button>
            </form>

            {/* Products List */}
            <div className="lg:col-span-7 space-y-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#0E0E10] border border-white/10 p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={p.gallery[0]}
                      alt={p.nameUz}
                      className="w-14 h-16 object-cover border border-white/10"
                    />
                    <div>
                      <div className="text-[10px] font-mono text-stone">
                        {p.sku} · {p.garmentArchetype.toUpperCase()}
                      </div>
                      <Link
                        href={`/product/${p.slug}`}
                        className="text-xs font-bold uppercase text-white hover:underline"
                      >
                        {p.nameUz}
                      </Link>
                      <div className="text-xs font-mono text-ash mt-0.5">
                        {formatUzs(p.priceUzs)} ·{" "}
                        {p.has3dModel ? "3D + 360°" : "360° Fallback"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAssetProductId(p.id);
                        setActiveTab("ASSETS_3D_360");
                      }}
                      className="border border-white/20 px-3 py-1.5 text-[10px] uppercase tracking-wider text-ash hover:text-white"
                    >
                      3D Sozlash
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-2 text-stone hover:text-red-400"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. 3D ASSETS & 360° STUDIO MANAGER TAB */}
        {activeTab === "ASSETS_3D_360" && selectedAssetProduct && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-[#0E0E10] border border-white/15 p-6 space-y-5">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white border-b border-white/10 pb-3">
                3D Model va 360° Kadrlar Boshqaruvi
              </h2>

              <div>
                <label className="block text-[11px] uppercase text-stone mb-1.5">
                  Mahsulotni tanlang
                </label>
                <select
                  value={selectedAssetProduct.id}
                  onChange={(e) => setSelectedAssetProductId(e.target.value)}
                  className="w-full bg-[#141418] border border-white/15 px-3 py-2.5 text-xs text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameUz} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3 border border-white/15 bg-[#141418] cursor-pointer">
                  <span className="text-xs text-white">
                    Real-Time 3D Viewer Faol
                  </span>
                  <input
                    type="checkbox"
                    checked={selectedAssetProduct.has3dModel}
                    onChange={(e) =>
                      handleSave3DAssetConfig(
                        e.target.checked,
                        selectedAssetProduct.garmentArchetype
                      )
                    }
                    className="accent-white w-4 h-4"
                  />
                </label>

                <div>
                  <label className="block text-[11px] uppercase text-stone mb-1.5">
                    3D Kiyim Geometriyasi (Archetype)
                  </label>
                  <select
                    value={selectedAssetProduct.garmentArchetype}
                    onChange={(e) =>
                      handleSave3DAssetConfig(
                        selectedAssetProduct.has3dModel,
                        e.target.value as GarmentArchetype
                      )
                    }
                    className="w-full bg-[#141418] border border-white/15 px-3 py-2.5 text-xs text-white"
                  >
                    <option value="overcoat">Overcoat (Palto)</option>
                    <option value="blazer">Blazer (Ikki bortli pijak)</option>
                    <option value="hoodie">Hoodie (580 GSM Xudi)</option>
                    <option value="overshirt">Overshirt (Kurtka)</option>
                    <option value="trousers">Trousers (Ikki taxlamli shim)</option>
                    <option value="turtleneck">Mock-Neck Knit</option>
                    <option value="tote">Leather Weekender Tote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase text-stone mb-1.5">
                    Tashqi Cloud .GLB / .glTF URL (S3 / CDN)
                  </label>
                  <input
                    type="text"
                    value={customModelUrlInput}
                    onChange={(e) => setCustomModelUrlInput(e.target.value)}
                    placeholder={
                      selectedAssetProduct.model3dUrl ||
                      "https://cdn.nnnbrand.uz/models/item.glb"
                    }
                    className="w-full bg-[#141418] border border-white/15 px-3 py-2.5 text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase text-stone mb-1.5">
                    360° Aylana Rasm URL Ro&apos;yxati (Har qatorda 1 ta URL)
                  </label>
                  <textarea
                    rows={3}
                    value={custom360UrlsInput}
                    onChange={(e) => setCustom360UrlsInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#141418] border border-white/15 p-3 text-xs font-mono text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleSave3DAssetConfig(
                      selectedAssetProduct.has3dModel,
                      selectedAssetProduct.garmentArchetype
                    )
                  }
                  className="w-full bg-white text-black py-3 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-ash transition"
                >
                  3D & 360° Sozlamalarni Saqlash
                </button>
              </div>
            </div>

            {/* Live 3D Studio Preview in Admin */}
            <div className="lg:col-span-7">
              <Product3DViewer
                archetype={selectedAssetProduct.garmentArchetype}
                modelUrl={selectedAssetProduct.model3dUrl}
                has3dModel={selectedAssetProduct.has3dModel}
                frames360={selectedAssetProduct.frames360}
                productName={selectedAssetProduct.nameUz}
                selectedColor={selectedAssetProduct.colors[0]}
                colors={selectedAssetProduct.colors}
              />
            </div>
          </div>
        )}

        {/* 4. INVENTORY MATRIX TAB */}
        {activeTab === "INVENTORY" && (
          <div className="bg-[#0E0E10] border border-white/10 p-6 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
              Ombor Zaxirasi Boshqaruvi (Real-Vaqtda)
            </h2>
            <div className="space-y-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="border border-white/10 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-[10px] font-mono text-stone">
                      {p.sku}
                    </span>
                    <div className="text-xs font-bold uppercase text-white">
                      {p.nameUz}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {p.sizes.map((s) => (
                      <div
                        key={s.size}
                        className="border border-white/15 bg-[#141418] px-3 py-2 flex items-center gap-2 text-xs font-mono"
                      >
                        <span className="font-bold text-white">{s.size}:</span>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStock(p.id, s.size, s.stock - 1)
                          }
                          className="px-1.5 bg-white/10 hover:bg-white hover:text-black"
                        >
                          -
                        </button>
                        <span
                          className={
                            s.stock <= 3 ? "text-amber-400" : "text-emerald-400"
                          }
                        >
                          {s.stock}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStock(p.id, s.size, s.stock + 1)
                          }
                          className="px-1.5 bg-white/10 hover:bg-white hover:text-black"
                        >
                          +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. ORDERS MANAGEMENT TAB */}
        {activeTab === "ORDERS" && (
          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="bg-[#0E0E10] border border-white/15 p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-sm font-mono font-bold text-white">
                      #{o.orderNumber}
                    </span>
                    <span className="ml-3 text-xs text-ash">
                      {o.customerName} · {o.customerPhone}
                    </span>
                    <div className="text-[11px] text-stone mt-0.5">
                      Manzil: {o.region}, {o.district}, {o.addressLine} (
                      {o.deliveryMethod})
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {o.paymentStatus === "PENDING_MERCHANT" && (
                      <button
                        type="button"
                        onClick={() => handleVerifyOrderPayment(o.id)}
                        className="bg-amber-400 text-black px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider"
                      >
                        {o.paymentMethod} To&apos;lovni Tasdiqlash
                      </button>
                    )}

                    <select
                      value={o.status}
                      onChange={(e) =>
                        handleUpdateOrderStatus(
                          o.id,
                          e.target.value as OrderStatus
                        )
                      }
                      className="bg-[#141418] border border-white/25 px-3 py-1.5 text-xs font-mono text-white"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="AWAITING_PAYMENT">AWAITING_PAYMENT</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  {o.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-ash">
                      <span>
                        • {item.nameUz} [{item.colorName} / {item.size}] ×{" "}
                        {item.quantity}
                      </span>
                      <span className="font-mono text-white">
                        {formatUzs(item.unitPriceUzs * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-stone">
                    Telegram: {o.telegramLog || "Yuborilgan"}
                  </span>
                  <span className="font-mono font-bold text-white text-sm">
                    JAMI: {formatUzs(o.totalUzs)} ({o.paymentMethod} /{" "}
                    {o.paymentStatus})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 6. CATEGORIES TAB */}
        {activeTab === "CATEGORIES" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form
              onSubmit={handleCreateCategory}
              className="lg:col-span-5 bg-[#0E0E10] border border-white/15 p-6 space-y-4 h-fit"
            >
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Yangi Kategoriya Qo&apos;shish
              </h2>
              <input
                type="text"
                required
                value={newCatNameUz}
                onChange={(e) => setNewCatNameUz(e.target.value)}
                placeholder="Kategoriya nomi (UZ)"
                className="w-full bg-[#141418] border border-white/15 px-3 py-2.5 text-xs text-white"
              />
              <input
                type="text"
                value={newCatNameEn}
                onChange={(e) => setNewCatNameEn(e.target.value)}
                placeholder="Category Name (EN)"
                className="w-full bg-[#141418] border border-white/15 px-3 py-2.5 text-xs text-white"
              />
              <textarea
                rows={3}
                value={newCatDescUz}
                onChange={(e) => setNewCatDescUz(e.target.value)}
                placeholder="Tavsif..."
                className="w-full bg-[#141418] border border-white/15 p-3 text-xs text-white"
              />
              <button
                type="submit"
                className="w-full bg-white text-black py-3 text-xs uppercase tracking-widest font-semibold"
              >
                Kategoriyani Saqlash
              </button>
            </form>

            <div className="lg:col-span-7 space-y-3">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="bg-[#0E0E10] border border-white/10 p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold uppercase text-white">
                      {c.nameUz} ({c.nameEn})
                    </div>
                    <div className="text-xs text-stone mt-0.5">
                      {c.descriptionUz}
                    </div>
                  </div>
                  <span className="font-mono text-xs text-ash">/{c.slug}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. PROMOTIONS TAB */}
        {activeTab === "PROMOTIONS" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form
              onSubmit={handleCreateDiscount}
              className="lg:col-span-5 bg-[#0E0E10] border border-white/15 p-6 space-y-4 h-fit"
            >
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Yangi Promo-Kod Yaratish
              </h2>
              <input
                type="text"
                required
                value={newPromoCode}
                onChange={(e) => setNewPromoCode(e.target.value)}
                placeholder="KOD (Masalan: NAVRUZ20)"
                className="w-full bg-[#141418] border border-white/15 px-3 py-2.5 text-xs font-mono uppercase text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newPromoType}
                  onChange={(e) => setNewPromoType(e.target.value as any)}
                  className="bg-[#141418] border border-white/15 px-3 py-2.5 text-xs text-white"
                >
                  <option value="PERCENTAGE">Foiz (%)</option>
                  <option value="FIXED_UZS">Summa (UZS)</option>
                </select>
                <input
                  type="number"
                  required
                  value={newPromoValue}
                  onChange={(e) => setNewPromoValue(e.target.value)}
                  placeholder="Qiymati"
                  className="bg-[#141418] border border-white/15 px-3 py-2.5 text-xs font-mono text-white"
                />
              </div>
              <input
                type="number"
                value={newPromoMinUzs}
                onChange={(e) => setNewPromoMinUzs(e.target.value)}
                placeholder="Minimal buyurtma summasi (UZS)"
                className="w-full bg-[#141418] border border-white/15 px-3 py-2.5 text-xs font-mono text-white"
              />
              <button
                type="submit"
                className="w-full bg-white text-black py-3 text-xs uppercase tracking-widest font-semibold"
              >
                Promo-Kodni Qo&apos;shish
              </button>
            </form>

            <div className="lg:col-span-7 space-y-3">
              {discounts.map((d) => (
                <div
                  key={d.id}
                  className="bg-[#0E0E10] border border-white/10 p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-mono font-bold text-white">
                      {d.code} —{" "}
                      {d.type === "PERCENTAGE"
                        ? `${d.value}%`
                        : formatUzs(d.value)}
                    </div>
                    <div className="text-xs text-stone">
                      Min. buyurtma: {formatUzs(d.minOrderUzs)} · Ishlatildi:{" "}
                      {d.usageCount} marta
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleDiscount(d.id)}
                    className={`px-3 py-1.5 text-[10px] font-mono uppercase border ${
                      d.active
                        ? "border-emerald-500/40 text-emerald-400"
                        : "border-white/15 text-stone"
                    }`}
                  >
                    {d.active ? "FAOL" : "O'CHIRILGAN"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. CUSTOMERS & SHOWROOM INQUIRIES TAB */}
        {activeTab === "CUSTOMERS" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-[#0E0E10] border border-white/10 p-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Ro&apos;yxatdan O&apos;tgan Mijozlar ({users.length})
              </h2>
              <div className="divide-y divide-white/10">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="py-3.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-stone font-mono">
                        {u.phone} · {u.email}
                      </div>
                      <div className="text-[11px] text-ash">{u.region}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-white font-bold">
                        {formatUzs(u.totalSpentUzs)}
                      </div>
                      <div className="text-stone text-[11px]">
                        {u.ordersCount} ta buyurtma
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#0E0E10] border border-white/10 p-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Showroom Murojaatlari ({inquiries.length})
              </h2>
              <div className="space-y-3">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="border border-white/10 bg-[#141418] p-4 space-y-1.5 text-xs"
                  >
                    <div className="flex justify-between font-semibold text-white">
                      <span>{inq.name}</span>
                      <span className="font-mono text-ash">{inq.phone}</span>
                    </div>
                    <div className="text-[11px] text-stone uppercase">
                      {inq.subject}{" "}
                      {inq.appointmentDate ? `(${inq.appointmentDate})` : ""}
                    </div>
                    <p className="text-ash pt-1">{inq.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
