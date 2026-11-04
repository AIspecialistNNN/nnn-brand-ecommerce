"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Box,
  Check,
  Heart,
  Image as ImageIcon,
  RotateCw,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { DICTIONARY, formatUzs, getLocalizedText } from "@/lib/i18n";
import { SizeCode } from "@/lib/types";
import Product360Viewer from "@/components/viewer/Product360Viewer";
import ProductCard from "@/components/product/ProductCard";

const Product3DViewer = dynamic(
  () => import("@/components/viewer/Product3DViewer"),
  { ssr: false }
);

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const {
    locale,
    products,
    addToCart,
    setIsCartDrawerOpen,
    toggleWishlist,
    isInWishlist,
  } = useStore();

  const product = useMemo(() => {
    return (
      products.find((p) => p.slug === params?.slug || p.id === params?.slug) ||
      products[0]
    );
  }, [products, params?.slug]);

  const [viewMode, setViewMode] = useState<"3D" | "360" | "GALLERY">("3D");
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<SizeCode>("M");
  const [quantity, setQuantity] = useState(1);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!product) return;
    setSelectedColorIdx(0);
    const firstAvailableSize =
      product.sizes.find((s) => s.stock > 0)?.size ||
      product.sizes[0]?.size ||
      "M";
    setSelectedSize(firstAvailableSize);
    setQuantity(1);
    setViewMode(product.has3dModel ? "3D" : "360");
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-stone">Mahsulot topilmadi.</p>
        <Link href="/shop" className="underline text-white mt-4 inline-block">
          Katalogga qaytish
        </Link>
      </div>
    );
  }

  const t = DICTIONARY[locale].product;
  const name = getLocalizedText(product, "name", locale);
  const subtitle = getLocalizedText(product, "subtitle", locale);
  const description = getLocalizedText(product, "description", locale);
  const fabric = getLocalizedText(product, "fabric", locale);
  const care = getLocalizedText(product, "care", locale);

  const selectedColor =
    product.colors[selectedColorIdx] || product.colors[0];
  const currentSizeObj =
    product.sizes.find((s) => s.size === selectedSize) || product.sizes[0];
  const currentStock = currentSizeObj?.stock ?? 0;
  const wished = isInWishlist(product.id);

  const relatedProducts = products
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    const res = addToCart(
      product.id,
      selectedColor.id,
      selectedSize,
      quantity
    );
    if (res.ok) {
      setFeedbackMsg({ type: "ok", text: res.message });
      setIsCartDrawerOpen(true);
    } else {
      setFeedbackMsg({ type: "err", text: res.message });
    }
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  return (
    <div className="bg-[#0A0A0A] text-[#F7F7F5] min-h-screen">
      {/* Breadcrumb Bar */}
      <div className="border-b border-white/10 bg-[#0D0D10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs text-stone">
          <div className="flex items-center gap-2">
            <Link
              href="/shop"
              className="hover:text-white flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Katalog</span>
            </Link>
            <span>/</span>
            <span className="uppercase tracking-wider text-ash">
              {product.categorySlug}
            </span>
            <span>/</span>
            <span className="text-white truncate max-w-[200px] sm:max-w-none">
              {name}
            </span>
          </div>
          <span className="font-mono text-[11px] text-stone">
            SKU: {product.sku}
          </span>
        </div>
      </div>

      {/* Main Product Studio Split Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT COLUMN: 3D / 360° / GALLERY INTERACTIVE VIEWPORT */}
          <div className="lg:col-span-7 space-y-4">
            {/* Mode Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#111114] border border-white/15 p-1.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setViewMode("3D")}
                  className={`px-4 py-2 text-xs uppercase tracking-[0.18em] flex items-center gap-2 transition ${
                    viewMode === "3D"
                      ? "bg-white text-black font-semibold"
                      : "text-ash hover:text-white"
                  }`}
                >
                  <Box className="w-4 h-4" />
                  <span>{t.mode3d}</span>
                  {!product.has3dModel && (
                    <span className="text-[9px] opacity-70">(Fallback)</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("360")}
                  className={`px-4 py-2 text-xs uppercase tracking-[0.18em] flex items-center gap-2 transition ${
                    viewMode === "360"
                      ? "bg-white text-black font-semibold"
                      : "text-ash hover:text-white"
                  }`}
                >
                  <RotateCw className="w-4 h-4" />
                  <span>{t.mode360}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("GALLERY")}
                  className={`px-4 py-2 text-xs uppercase tracking-[0.18em] flex items-center gap-2 transition ${
                    viewMode === "GALLERY"
                      ? "bg-white text-black font-semibold"
                      : "text-ash hover:text-white"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>
                    {t.modeGallery} ({product.gallery.length})
                  </span>
                </button>
              </div>

              <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-widest text-stone pr-2">
                {product.weightGsm} GSM · {product.fitType}
              </span>
            </div>

            {/* Active Viewport */}
            {viewMode === "3D" && (
              <Product3DViewer
                archetype={product.garmentArchetype}
                modelUrl={product.model3dUrl}
                has3dModel={product.has3dModel}
                frames360={product.frames360}
                productName={name}
                selectedColor={selectedColor}
                colors={product.colors}
                onSelectColor={(c) => {
                  const idx = product.colors.findIndex((col) => col.id === c.id);
                  if (idx >= 0) setSelectedColorIdx(idx);
                }}
                locale={locale}
              />
            )}

            {viewMode === "360" && (
              <Product360Viewer
                frames={product.frames360}
                productName={name}
                selectedColor={selectedColor}
                isFallbackNotice={false}
                locale={locale}
              />
            )}

            {viewMode === "GALLERY" && (
              <div className="space-y-3">
                <div className="relative h-[520px] sm:h-[620px] w-full bg-[#111114] border border-white/10 overflow-hidden">
                  <img
                    src={
                      product.gallery[activeGalleryIdx] || product.gallery[0]
                    }
                    alt={name}
                    className="w-full h-full object-cover object-center"
                  />
                  {selectedColorIdx > 0 && (
                    <div
                      className="absolute inset-0 mix-blend-color opacity-30 pointer-events-none"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Thumbnail Strip (Clicking switches to Gallery or previews angle) */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {product.gallery.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveGalleryIdx(idx);
                    setViewMode("GALLERY");
                  }}
                  className={`aspect-[3/4] overflow-hidden border transition ${
                    viewMode === "GALLERY" && activeGalleryIdx === idx
                      ? "border-white ring-1 ring-white"
                      : "border-white/15 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              <button
                type="button"
                onClick={() => setViewMode("3D")}
                className={`aspect-[3/4] border flex flex-col items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-wider transition ${
                  viewMode === "3D"
                    ? "border-white bg-white text-black font-semibold"
                    : "border-white/15 bg-[#121215] text-ash hover:text-white"
                }`}
              >
                <Box className="w-5 h-5" />
                <span>3D VIEW</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("360")}
                className={`aspect-[3/4] border flex flex-col items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-wider transition ${
                  viewMode === "360"
                    ? "border-white bg-white text-black font-semibold"
                    : "border-white/15 bg-[#121215] text-ash hover:text-white"
                }`}
              >
                <RotateCw className="w-5 h-5" />
                <span>360° SPIN</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: PRODUCT SPECIFICATION, COLOR/SIZE & PURCHASE */}
          <div className="lg:col-span-5 space-y-7">
            <div className="border-b border-white/10 pb-6 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-stone">
                <span>NNN BRAND ATELIER</span>
                <span>{product.origin}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-[0.12em] text-white">
                {name}
              </h1>
              <p className="text-xs sm:text-sm text-stone">{subtitle}</p>

              <div className="pt-3 flex items-baseline gap-3">
                <span className="text-2xl font-mono font-bold text-white">
                  {formatUzs(product.priceUzs)}
                </span>
                {product.compareAtPriceUzs && (
                  <span className="text-sm font-mono text-stone line-through">
                    {formatUzs(product.compareAtPriceUzs)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-ash leading-relaxed">
              {description}
            </p>

            {/* Color Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest">
                <span className="text-stone">{t.selectColor}:</span>
                <span className="text-white font-medium">
                  {getLocalizedText(selectedColor, "name", locale)}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {product.colors.map((color, idx) => {
                  const active = idx === selectedColorIdx;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setSelectedColorIdx(idx)}
                      className={`flex items-center gap-2.5 px-3.5 py-2 border text-xs transition ${
                        active
                          ? "border-white bg-white/10 text-white"
                          : "border-white/15 text-stone hover:border-white/40 hover:text-white"
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-white/30"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{getLocalizedText(color, "name", locale)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selection & Size Guide Trigger */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest">
                <span className="text-stone">{t.selectSize}:</span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-ash hover:text-white underline flex items-center gap-1.5"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>{t.sizeGuide}</span>
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                {product.sizes.map((s) => {
                  const isSelected = s.size === selectedSize;
                  const out = s.stock <= 0;
                  return (
                    <button
                      key={s.size}
                      type="button"
                      disabled={out}
                      onClick={() => setSelectedSize(s.size)}
                      className={`py-3 text-xs font-mono uppercase border transition flex flex-col items-center justify-center ${
                        out
                          ? "border-white/5 bg-white/[0.02] text-stone/40 line-through cursor-not-allowed"
                          : isSelected
                          ? "border-white bg-white text-black font-bold"
                          : "border-white/15 bg-[#121215] text-white hover:border-white/50"
                      }`}
                    >
                      <span>{s.size}</span>
                      <span
                        className={`text-[9px] mt-0.5 ${
                          isSelected ? "text-black/75" : "text-stone"
                        }`}
                      >
                        {out ? "0 dona" : `${s.stock} dona`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Live Inventory Status Pill */}
              <div className="flex items-center justify-between text-xs pt-1">
                {currentStock > 5 ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {t.inStock} ({currentStock} dona omborda)
                  </span>
                ) : currentStock > 0 ? (
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    {t.lowStock}: faqat {currentStock} dona qoldi
                  </span>
                ) : (
                  <span className="text-red-400">{t.outOfStock}</span>
                )}
                <span className="text-[11px] font-mono text-stone">
                  Ko&apos;krak/Eni: {currentSizeObj?.chestCm} sm · Bo&apos;yi:{" "}
                  {currentSizeObj?.lengthCm} sm
                </span>
              </div>
            </div>

            {/* Quantity & Add to Cart / Wishlist Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                {/* Quantity Selector */}
                <div className="flex items-center border border-white/20 bg-[#121215]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-3.5 text-ash hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-mono text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.min(Math.max(1, currentStock), q + 1))
                    }
                    className="px-3.5 py-3.5 text-ash hover:text-white"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  type="button"
                  disabled={currentStock <= 0}
                  onClick={handleAddToCart}
                  className="flex-1 bg-white text-black py-4 px-6 text-xs uppercase tracking-[0.22em] font-semibold hover:bg-ash disabled:opacity-40 transition flex items-center justify-center gap-2.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {currentStock <= 0 ? t.outOfStock : t.addToCart}
                  </span>
                </button>

                {/* Wishlist Toggle */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`px-4 border transition flex items-center justify-center ${
                    wished
                      ? "bg-white text-black border-white"
                      : "border-white/20 text-white hover:border-white"
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${wished ? "fill-black" : ""}`} />
                </button>
              </div>

              {feedbackMsg && (
                <div
                  className={`p-3 border text-xs flex items-center gap-2 ${
                    feedbackMsg.type === "ok"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-red-500/40 bg-red-500/10 text-red-300"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{feedbackMsg.text}</span>
                </div>
              )}
            </div>

            {/* Fabric Composition, Care & Uzbekistan Delivery Specs */}
            <div className="border-t border-white/10 pt-6 space-y-4 text-xs">
              <div className="border border-white/10 bg-[#0E0E10] p-4 space-y-1.5">
                <div className="uppercase tracking-widest text-white font-semibold">
                  {t.fabricComposition}
                </div>
                <p className="text-ash">{fabric}</p>
              </div>

              <div className="border border-white/10 bg-[#0E0E10] p-4 space-y-1.5">
                <div className="uppercase tracking-widest text-white font-semibold">
                  {t.careInstructions}
                </div>
                <p className="text-ash">{care}</p>
              </div>

              <div className="border border-white/10 bg-[#0E0E10] p-4 space-y-2">
                <div className="uppercase tracking-widest text-white font-semibold flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>{t.deliveryAndReturns}</span>
                </div>
                <p className="text-stone leading-relaxed">
                  • Toshkent shahri bo&apos;ylab VIP Express kuryer (2–3 soat ichida).
                  <br />• O&apos;zbekistonning barcha viloyatlariga 1–2 ish kunida yetkazib
                  berish.
                  <br />• Click, Payme yoki yetkazilganda naqd/karta orqali to&apos;lov.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS SECTION */}
        <div className="mt-24 pt-16 border-t border-white/10">
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.18em] text-white mb-8">
            {t.relatedProducts}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      </div>

      {/* SIZE GUIDE MODAL */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0E0E10] border border-white/20 max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                  NNN BRAND — {t.sizeGuide}
                </h3>
                <p className="text-xs text-stone mt-1">{name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                className="p-1.5 text-stone hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/15 text-stone uppercase tracking-wider">
                    <th className="py-2.5">O&apos;lcham</th>
                    <th className="py-2.5">Ko&apos;krak / Bel (sm)</th>
                    <th className="py-2.5">Yelka / Son (sm)</th>
                    <th className="py-2.5">Uzunligi (sm)</th>
                    <th className="py-2.5">Ombor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 font-mono">
                  {product.sizes.map((s) => (
                    <tr key={s.size} className="text-white">
                      <td className="py-3 font-bold">{s.size}</td>
                      <td className="py-3">{s.chestCm}</td>
                      <td className="py-3">{s.shoulderCm}</td>
                      <td className="py-3">{s.lengthCm}</td>
                      <td className="py-3 text-ash">{s.stock} dona</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-stone leading-relaxed">
              Model bichimi: <strong className="text-white">{product.fitType}</strong>.
              Agar ikki o&apos;lcham orasida ikkilansangiz, Toshkent showroomimizga
              (+998 78 113 99 00) murojaat qilishingiz mumkin.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
