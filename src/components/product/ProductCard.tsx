"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Box, Heart, RotateCw } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { DICTIONARY, formatUzs, getLocalizedText } from "@/lib/i18n";
import { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const { locale, toggleWishlist, isInWishlist } = useStore();
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const wished = isInWishlist(product.id);
  const name = getLocalizedText(product, "name", locale);
  const subtitle = getLocalizedText(product, "subtitle", locale);
  const activeColor = product.colors[selectedColorIdx] || product.colors[0];

  const primaryImg = product.gallery[0];
  const secondaryImg = product.gallery[1] || product.gallery[0];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-[#0E0E10] border border-white/10 hover:border-white/30 transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#141417]">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered ? secondaryImg : primaryImg}
            alt={name}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
          {/* Subtle color tint indicator when user clicks non-default swatch */}
          {selectedColorIdx > 0 && (
            <div
              className="absolute inset-0 mix-blend-color opacity-30 pointer-events-none transition-colors"
              style={{ backgroundColor: activeColor.hex }}
            />
          )}
        </Link>

        {/* Top Left 3D / 360 Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {product.has3dModel ? (
            <span className="bg-black/80 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-white flex items-center gap-1.5">
              <Box className="w-3 h-3" />
              {DICTIONARY[locale].sections.interactive3dBadge}
            </span>
          ) : (
            <span className="bg-black/80 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-ash flex items-center gap-1.5">
              <RotateCw className="w-3 h-3" />
              {DICTIONARY[locale].sections.fallback360Badge}
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-white text-black px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest w-fit">
              NEW
            </span>
          )}
        </div>

        {/* Top Right Wishlist Button */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          className={`absolute top-3 right-3 p-2 border transition ${
            wished
              ? "bg-white text-black border-white"
              : "bg-black/70 text-white border-white/15 hover:bg-white hover:text-black"
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${wished ? "fill-black" : ""}`} />
        </button>

        {/* Quick Inspect CTA on Hover */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Link
            href={`/product/${product.slug}`}
            className="block w-full bg-black/90 hover:bg-white hover:text-black text-white border border-white/20 py-2.5 text-center text-[11px] uppercase tracking-[0.2em] font-medium transition"
          >
            {product.has3dModel ? "3D + 360° Ko'rish" : "360° Ko'rish"}
          </Link>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono text-stone uppercase tracking-widest mb-1">
            <span>{product.sku}</span>
            <span>{product.weightGsm} GSM</span>
          </div>
          <Link
            href={`/product/${product.slug}`}
            className="text-sm font-medium text-white hover:underline line-clamp-1"
          >
            {name}
          </Link>
          <p className="text-xs text-stone line-clamp-1 mt-0.5">{subtitle}</p>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          {/* Color Swatches */}
          <div className="flex items-center gap-1.5">
            {product.colors.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedColorIdx(idx)}
                className={`w-3.5 h-3.5 rounded-full border transition ${
                  idx === selectedColorIdx
                    ? "border-white scale-110 ring-1 ring-white/50"
                    : "border-white/30 opacity-70 hover:opacity-100"
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.nameUz}
              />
            ))}
          </div>

          {/* Price in UZS */}
          <div className="text-right">
            {product.compareAtPriceUzs && (
              <span className="block text-[10px] font-mono text-stone line-through">
                {formatUzs(product.compareAtPriceUzs)}
              </span>
            )}
            <span className="text-xs sm:text-sm font-mono font-semibold text-white">
              {formatUzs(product.priceUzs)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
