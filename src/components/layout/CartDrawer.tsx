"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { DICTIONARY, formatUzs, getLocalizedText } from "@/lib/i18n";

export default function CartDrawer() {
  const {
    locale,
    cart,
    products,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotalUzs,
  } = useStore();

  if (!isCartDrawerOpen) return null;

  const t = DICTIONARY[locale].cart;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Panel */}
      <div className="relative z-10 w-full max-w-md bg-[#0E0E10] border-l border-white/15 h-full flex flex-col justify-between text-white">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-sm uppercase tracking-[0.22em] font-semibold">
              {t.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-2 text-stone hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-10 h-10 text-stone mb-4 stroke-1" />
              <p className="text-sm text-stone mb-6">{t.empty}</p>
              <Link
                href="/shop"
                onClick={() => setIsCartDrawerOpen(false)}
                className="border border-white px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition"
              >
                {t.continueShopping}
              </Link>
            </div>
          ) : (
            cart.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              if (!product) return null;
              const color =
                product.colors.find((c) => c.id === item.colorId) ||
                product.colors[0];
              const name = getLocalizedText(product, "name", locale);
              const colorName = getLocalizedText(color, "name", locale);

              return (
                <div
                  key={`${item.productId}-${item.colorId}-${item.size}`}
                  className="flex gap-4 pb-5 border-b border-white/10"
                >
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="w-20 h-24 bg-[#18181B] flex-shrink-0 overflow-hidden border border-white/10"
                  >
                    <img
                      src={product.gallery[0]}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={() => setIsCartDrawerOpen(false)}
                        className="text-xs font-medium uppercase tracking-wider text-white hover:underline truncate"
                      >
                        {name}
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(item.productId, item.colorId, item.size)
                        }
                        className="text-stone hover:text-white transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-stone">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/30"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{colorName}</span>
                      <span>·</span>
                      <span className="font-mono text-white">{item.size}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-white/15">
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
                          className="p-1.5 text-stone hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-mono">
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
                          className="p-1.5 text-stone hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-mono text-white">
                        {formatUzs(product.priceUzs * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-white/15 bg-[#121215] space-y-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest">
              <span className="text-stone">{t.subtotal}</span>
              <span className="text-sm font-mono font-semibold text-white">
                {formatUzs(cartSubtotalUzs)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={() => setIsCartDrawerOpen(false)}
                className="border border-white/25 py-3 text-center text-xs uppercase tracking-[0.18em] text-white hover:border-white transition"
              >
                {DICTIONARY[locale].nav.cart}
              </Link>
              <Link
                href="/checkout"
                onClick={() => setIsCartDrawerOpen(false)}
                className="bg-white text-black py-3 text-center text-xs uppercase tracking-[0.18em] font-semibold hover:bg-ash transition flex items-center justify-center gap-1.5"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
