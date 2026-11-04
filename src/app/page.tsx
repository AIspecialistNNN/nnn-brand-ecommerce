"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, Box, CheckCircle2, Layers, Shield, Sparkles } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { DICTIONARY, formatUzs, getLocalizedText } from "@/lib/i18n";
import ProductCard from "@/components/product/ProductCard";

const Product3DViewer = dynamic(
  () => import("@/components/viewer/Product3DViewer"),
  { ssr: false }
);

export default function HomePage() {
  const { locale, products, categories } = useStore();
  const t = DICTIONARY[locale];

  const [showcaseIdx, setShowcaseIdx] = useState(0);
  const threeDProducts = products.filter((p) => p.has3dModel);
  const active3DProduct =
    threeDProducts[showcaseIdx % Math.max(1, threeDProducts.length)] ||
    products[0];
  const [selectedHeroColorIdx, setSelectedHeroColorIdx] = useState(0);

  const activeColor =
    active3DProduct?.colors[selectedHeroColorIdx] ||
    active3DProduct?.colors[0] || {
      id: "obsidian",
      nameUz: "Obsidian Qora",
      nameRu: "Черный",
      nameEn: "Obsidian Black",
      hex: "#141416",
      roughness: 0.78,
      metalness: 0.05,
    };

  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 4);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const featuredCategories = categories.filter((c) => c.featured);

  return (
    <div className="bg-[#0A0A0A] text-[#F7F7F5]">
      {/* 1. CINEMATIC EDITORIAL HERO SECTION */}
      <section className="relative min-h-[88vh] flex items-center border-b border-white/10 overflow-hidden">
        {/* Background Editorial Photography with Dark Architectural Mask */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=2000&q=85"
            alt="NNN BRAND Editorial"
            className="w-full h-full object-cover object-center opacity-35 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Editorial Typography */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-3 border border-white/15 bg-white/[0.03] px-4 py-1.5 text-[11px] uppercase tracking-[0.24em] text-ash">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>{t.hero.eyebrow}</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-5xl sm:text-7xl xl:text-8xl font-bold tracking-[0.2em] uppercase text-white leading-none">
                  NNN BRAND
                </h1>
                <p className="text-xl sm:text-3xl font-light tracking-[0.16em] uppercase text-ash">
                  &ldquo;{t.hero.slogan}&rdquo;
                </p>
              </div>

              <p className="max-w-xl text-sm sm:text-base text-stone leading-relaxed">
                {t.hero.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/shop"
                  className="bg-white text-black px-8 py-4 text-xs uppercase tracking-[0.22em] font-semibold hover:bg-ash transition flex items-center gap-3"
                >
                  <span>{t.hero.shopCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href={`/product/${active3DProduct?.slug || "monolith-wool-overcoat"}`}
                  className="border border-white/25 bg-black/50 backdrop-blur-sm text-white px-7 py-4 text-xs uppercase tracking-[0.22em] hover:border-white transition flex items-center gap-2.5"
                >
                  <Box className="w-4 h-4" />
                  <span>{t.hero.explore3d}</span>
                </Link>
              </div>

              {/* Architectural Pillar Metrics */}
              <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <div className="text-lg sm:text-xl font-mono font-semibold text-white">
                    360° + 3D
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-stone mt-0.5">
                    Real-Time WebGL Studio
                  </div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-mono font-semibold text-white">
                    580–780 GSM
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-stone mt-0.5">
                    Italiya & O&apos;zbek Matosi
                  </div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-mono font-semibold text-white">
                    CLICK · PAYME
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-stone mt-0.5">
                    VIP Toshkent Kuryer
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive 3D Hero Preview */}
            <div className="lg:col-span-5">
              {active3DProduct && (
                <div className="bg-[#0E0E10] border border-white/15 p-3">
                  <Product3DViewer
                    archetype={active3DProduct.garmentArchetype}
                    modelUrl={active3DProduct.model3dUrl}
                    has3dModel={true}
                    frames360={active3DProduct.frames360}
                    productName={getLocalizedText(active3DProduct, "name", locale)}
                    selectedColor={activeColor}
                    colors={active3DProduct.colors}
                    onSelectColor={(c) => {
                      const idx = active3DProduct.colors.findIndex(
                        (col) => col.id === c.id
                      );
                      setSelectedHeroColorIdx(idx >= 0 ? idx : 0);
                    }}
                    locale={locale}
                    compact={true}
                  />
                  <div className="mt-3 px-2 py-1 flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider font-medium text-white">
                        {getLocalizedText(active3DProduct, "name", locale)}
                      </div>
                      <div className="text-xs font-mono text-stone">
                        {formatUzs(active3DProduct.priceUzs)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedHeroColorIdx(0);
                          setShowcaseIdx((i) => i + 1);
                        }}
                        className="border border-white/20 px-3 py-1.5 text-[10px] uppercase tracking-widest text-ash hover:text-white hover:border-white transition"
                      >
                        Keyingi 3D Model →
                      </button>
                      <Link
                        href={`/product/${active3DProduct.slug}`}
                        className="bg-white text-black px-3 py-1.5 text-[10px] uppercase tracking-widest font-semibold hover:bg-ash transition"
                      >
                        Batafsil
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-stone">
              01 / DROP AW26
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold uppercase tracking-[0.16em] text-white mt-2">
              {t.sections.newArrivals}
            </h2>
          </div>
          <Link
            href="/shop?filter=new"
            className="text-xs uppercase tracking-[0.2em] text-ash hover:text-white flex items-center gap-2 border-b border-white/20 pb-1 w-fit"
          >
            <span>{t.sections.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 3. FEATURED COLLECTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-white/10">
        <div className="mb-12">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-stone">
            02 / ARCHITECTURAL SILHOUETTES
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold uppercase tracking-[0.16em] text-white mt-2">
            {t.sections.featuredCollections}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCategories.map((cat, idx) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative h-[460px] overflow-hidden border border-white/10 bg-[#121215] flex flex-col justify-end p-8"
            >
              <img
                src={cat.heroImage}
                alt={getLocalizedText(cat, "name", locale)}
                className="absolute inset-0 w-full h-full object-cover opacity-55 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              <div className="relative z-10 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-stone">
                  COLLECTION 0{idx + 1}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.15em] text-white">
                  {getLocalizedText(cat, "name", locale)}
                </h3>
                <p className="text-xs text-ash line-clamp-2">
                  {getLocalizedText(cat, "description", locale)}
                </p>
                <div className="pt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white group-hover:translate-x-1 transition-transform">
                  <span>{t.hero.shopCta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-stone">
              03 / ESSENTIAL ARCHIVE
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold uppercase tracking-[0.16em] text-white mt-2">
              {t.sections.bestSellers}
            </h2>
          </div>
          <Link
            href="/shop?sort=bestseller"
            className="text-xs uppercase tracking-[0.2em] text-ash hover:text-white flex items-center gap-2 border-b border-white/20 pb-1 w-fit"
          >
            <span>{t.sections.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. BRAND STORY & MANIFESTO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-stone">
              04 / MAISON MANIFESTO
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-[0.16em] text-white leading-tight">
              LESS NOISE.
              <br />
              MORE IDENTITY.
            </h2>
            <p className="text-sm sm:text-base text-ash leading-relaxed">
              {locale === "uz"
                ? "NNN BRAND zamonaviy erkaklar modasida ortiqcha logotiplar va tez o'tuvchi trendlardan voz kechib, me'moriy proporsiya, og'ir vaznli tabiiy matolar va raqamli 3D aniqlikka urg'u beradi. Har bir kiyim Toshkent va Milan konstruktorlari tomonidan millimetrgacha hisoblangan siluet asosida yaratiladi."
                : locale === "ru"
                ? "NNN BRAND отказывается от визуального шума и мимолетных трендов в пользу архитектурных пропорций, тяжелых натуральных тканей и цифровой 3D-точности."
                : "NNN BRAND strips away seasonal noise in favor of architectural proportion, heavyweight natural textiles, and interactive 3D digital craftsmanship."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="border border-white/10 bg-[#0E0E10] p-4 space-y-2">
                <Layers className="w-5 h-5 text-white" />
                <div className="text-xs font-semibold uppercase tracking-wider text-white">
                  Premium Mato
                </div>
                <p className="text-[11px] text-stone">
                  Biella virgin juni va 580 GSM O&apos;zbekiston organik paxtasi.
                </p>
              </div>
              <div className="border border-white/10 bg-[#0E0E10] p-4 space-y-2">
                <Sparkles className="w-5 h-5 text-white" />
                <div className="text-xs font-semibold uppercase tracking-wider text-white">
                  3D Digital Twin
                </div>
                <p className="text-[11px] text-stone">
                  Har bir kiyimni 360° va real-vaqtda 3D formatda tekshiring.
                </p>
              </div>
              <div className="border border-white/10 bg-[#0E0E10] p-4 space-y-2">
                <Shield className="w-5 h-5 text-white" />
                <div className="text-xs font-semibold uppercase tracking-wider text-white">
                  Toshkent Atelier
                </div>
                <p className="text-[11px] text-stone">
                  Individual o&apos;lcham kafolati va O&apos;zbekiston bo&apos;ylab tezkor yetkazish.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-3 border border-white px-7 py-3.5 text-xs uppercase tracking-[0.22em] hover:bg-white hover:text-black transition"
              >
                <span>{t.sections.brandStory}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] overflow-hidden border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1000&q=85"
                alt="NNN Atelier Overcoat"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-[3/4] overflow-hidden border border-white/10 mt-8">
              <img
                src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=85"
                alt="NNN Tailoring"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
