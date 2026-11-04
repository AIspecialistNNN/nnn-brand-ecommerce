"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import {
  DICTIONARY,
  formatUzs,
  getLocalizedText,
  SHIPPING_OPTIONS,
} from "@/lib/i18n";

export default function CartPage() {
  const {
    locale,
    cart,
    products,
    updateCartQuantity,
    removeFromCart,
    cartSubtotalUzs,
    appliedPromo,
    discountAmountUzs,
    applyPromoCode,
    removePromoCode,
    discounts,
  } = useStore();

  const [promoInput, setPromoInput] = useState("");
  const [promoStatus, setPromoStatus] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const t = DICTIONARY[locale].cart;

  const estimatedShipping =
    cartSubtotalUzs >= SHIPPING_OPTIONS[0].freeThresholdUzs ||
    cartSubtotalUzs === 0
      ? 0
      : SHIPPING_OPTIONS[0].priceUzs;

  const finalTotalUzs = Math.max(
    0,
    cartSubtotalUzs - discountAmountUzs + estimatedShipping
  );

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyPromoCode(promoInput);
    setPromoStatus(res);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F7F7F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="border-b border-white/10 pb-6 mb-10 flex items-end justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-stone">
              NNN BRAND ATELIER
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-[0.18em] text-white mt-2">
              {t.title}
            </h1>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest text-ash hover:text-white underline"
          >
            {t.continueShopping}
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="border border-white/10 bg-[#0E0E10] py-24 text-center space-y-6">
            <ShoppingBag className="w-12 h-12 text-stone mx-auto stroke-1" />
            <p className="text-base text-ash">{t.empty}</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-ash transition"
            >
              <span>{t.continueShopping}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Line Items */}
            <div className="lg:col-span-8 space-y-4">
              {cart.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                if (!product) return null;
                const color =
                  product.colors.find((c) => c.id === item.colorId) ||
                  product.colors[0];
                const sizeObj = product.sizes.find((s) => s.size === item.size);
                const name = getLocalizedText(product, "name", locale);
                const colorName = getLocalizedText(color, "name", locale);

                return (
                  <div
                    key={`${item.productId}-${item.colorId}-${item.size}`}
                    className="flex flex-col sm:flex-row gap-5 p-5 bg-[#0E0E10] border border-white/10"
                  >
                    <Link
                      href={`/product/${product.slug}`}
                      className="w-28 h-36 bg-[#161618] border border-white/10 flex-shrink-0 overflow-hidden"
                    >
                      <img
                        src={product.gallery[0]}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-stone">
                              {product.sku}
                            </span>
                            <Link
                              href={`/product/${product.slug}`}
                              className="block text-sm sm:text-base font-semibold uppercase tracking-wider text-white hover:underline mt-0.5"
                            >
                              {name}
                            </Link>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(
                                item.productId,
                                item.colorId,
                                item.size
                              )
                            }
                            className="text-stone hover:text-white p-1"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-ash">
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-3 h-3 rounded-full border border-white/30"
                              style={{ backgroundColor: color.hex }}
                            />
                            {colorName}
                          </span>
                          <span>
                            O&apos;lcham:{" "}
                            <strong className="font-mono text-white">
                              {item.size}
                            </strong>
                          </span>
                          {sizeObj && (
                            <span className="text-[11px] text-stone">
                              (Omborda: {sizeObj.stock} dona)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center border border-white/20 bg-[#141418]">
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(
                                item.productId,
                                item.colorId,
                                item.size,
                                item.quantity - 1
                              )
                            }
                            className="p-2 text-ash hover:text-white"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-4 text-xs font-mono text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(
                                item.productId,
                                item.colorId,
                                item.size,
                                item.quantity + 1
                              )
                            }
                            className="p-2 text-ash hover:text-white"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-stone font-mono">
                            {formatUzs(product.priceUzs)} × {item.quantity}
                          </div>
                          <div className="text-sm font-mono font-bold text-white">
                            {formatUzs(product.priceUzs * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Order Summary & Promo Code */}
            <div className="lg:col-span-4">
              <div className="bg-[#0E0E10] border border-white/15 p-6 space-y-6 sticky top-28">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white border-b border-white/10 pb-4">
                  Buyurtma Xulosasi
                </h2>

                {/* Promo Code Form */}
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest text-stone block">
                    Promo-kod
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder={t.promoPlaceholder}
                      className="flex-1 bg-[#141418] border border-white/15 px-3 py-2.5 text-xs text-white uppercase font-mono placeholder:text-stone focus:outline-none focus:border-white"
                    />
                    <button
                      type="submit"
                      className="border border-white px-4 py-2.5 text-xs uppercase tracking-widest text-white hover:bg-white hover:text-black transition"
                    >
                      {t.applyPromo}
                    </button>
                  </div>
                  {promoStatus && (
                    <p
                      className={`text-[11px] ${
                        promoStatus.ok ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {promoStatus.message}
                    </p>
                  )}

                  {/* Active Promo Codes Hint */}
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    {discounts
                      .filter((d) => d.active)
                      .map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setPromoInput(d.code);
                            setPromoStatus(applyPromoCode(d.code));
                          }}
                          className="text-[10px] font-mono border border-white/15 bg-white/[0.03] px-2 py-0.5 text-ash hover:border-white transition flex items-center gap-1"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          <span>{d.code}</span>
                        </button>
                      ))}
                  </div>
                </form>

                {appliedPromo && (
                  <div className="flex items-center justify-between bg-white/[0.05] border border-white/20 px-3 py-2 text-xs">
                    <div>
                      <span className="font-mono font-bold text-white">
                        {appliedPromo.code}
                      </span>
                      <span className="block text-[10px] text-stone">
                        {appliedPromo.descriptionUz}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removePromoCode}
                      className="text-stone hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-3 text-xs border-t border-white/10 pt-4">
                  <div className="flex justify-between text-ash">
                    <span>{t.subtotal}</span>
                    <span className="font-mono">
                      {formatUzs(cartSubtotalUzs)}
                    </span>
                  </div>

                  {discountAmountUzs > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>{t.discount}</span>
                      <span className="font-mono">
                        -{formatUzs(discountAmountUzs)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-ash">
                    <span>{t.shipping}</span>
                    <span className="font-mono">
                      {estimatedShipping === 0
                        ? "BEPUL (0 UZS)"
                        : formatUzs(estimatedShipping)}
                    </span>
                  </div>

                  <div className="border-t border-white/15 pt-3 flex justify-between items-baseline text-sm font-bold text-white">
                    <span className="uppercase tracking-wider">{t.total}</span>
                    <span className="text-lg font-mono">
                      {formatUzs(finalTotalUzs)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-white text-black py-4 text-xs uppercase tracking-[0.22em] font-semibold hover:bg-ash transition flex items-center justify-center gap-2"
                >
                  <span>{t.proceedToCheckout}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
