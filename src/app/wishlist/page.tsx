"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import ProductCard from "@/components/product/ProductCard";

export default function WishlistPage() {
  const { locale, products, wishlistIds } = useStore();
  const wishedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F7F7F5] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-white/10 pb-6 mb-10 flex items-end justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-stone">
              NNN BRAND CURATED ARCHIVE
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-[0.18em] text-white mt-2">
              {locale === "uz"
                ? "Tanlangan Modellar"
                : locale === "ru"
                ? "Избранные Модели"
                : "Saved Wishlist"}{" "}
              ({wishedProducts.length})
            </h1>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest text-ash hover:text-white underline"
          >
            Katalogga o&apos;tish
          </Link>
        </div>

        {wishedProducts.length === 0 ? (
          <div className="border border-white/10 bg-[#0E0E10] py-24 text-center space-y-5">
            <Heart className="w-10 h-10 text-stone mx-auto stroke-1" />
            <p className="text-sm text-ash">
              Tanlanganlar ro&apos;yxatida hozircha mahsulot yo&apos;q.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-white text-black px-7 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-ash transition"
            >
              <span>Kolleksiyani ko&apos;rish</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
