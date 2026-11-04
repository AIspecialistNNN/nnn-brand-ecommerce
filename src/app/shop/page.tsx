"use client";

import React, { useMemo, useState } from "react";
import { Box, Filter, RotateCcw, Search } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { getLocalizedText } from "@/lib/i18n";
import { SizeCode } from "@/lib/types";
import ProductCard from "@/components/product/ProductCard";

export default function ShopPage() {
  const { locale, products, categories } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<SizeCode | "all">("all");
  const [only3D, setOnly3D] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "newest" | "price_asc" | "price_desc" | "bestseller"
  >("newest");

  const sizes: SizeCode[] = ["XS", "S", "M", "L", "XL"];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (
          selectedCategory !== "all" &&
          p.categorySlug !== selectedCategory &&
          p.categoryId !== selectedCategory
        ) {
          return false;
        }
        if (selectedSize !== "all") {
          const hasSizeInStock = p.sizes.some(
            (s) => s.size === selectedSize && s.stock > 0
          );
          if (!hasSizeInStock) return false;
        }
        if (only3D && !p.has3dModel) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName =
            p.nameUz.toLowerCase().includes(q) ||
            p.nameRu.toLowerCase().includes(q) ||
            p.nameEn.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q);
          if (!matchName) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.priceUzs - b.priceUzs;
        if (sortBy === "price_desc") return b.priceUzs - a.priceUzs;
        if (sortBy === "bestseller")
          return Number(b.isBestSeller) - Number(a.isBestSeller);
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [
    products,
    selectedCategory,
    selectedSize,
    only3D,
    searchQuery,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedSize("all");
    setOnly3D(false);
    setSearchQuery("");
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F7F7F5]">
      {/* Page Header */}
      <div className="border-b border-white/10 bg-[#0D0D10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-stone">
            NNN BRAND ARCHIVE · AW26
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold uppercase tracking-[0.18em] text-white mt-2">
            {locale === "uz"
              ? "Kolleksiya Katalogi"
              : locale === "ru"
              ? "Каталог Коллекции"
              : "Collection Catalog"}
          </h1>
          <p className="text-xs sm:text-sm text-stone max-w-2xl mt-3">
            {locale === "uz"
              ? "Barcha modellarni interaktiv 3D rejimda yoki 360° studiya kadrlarida ko'rib chiqing. O'lcham va rang bo'yicha real-vaqtda ombor qoldig'i tekshiriladi."
              : locale === "ru"
              ? "Исследуйте каждое изделие в интерактивном 3D или 360° студийном режиме с проверкой наличия размеров."
              : "Explore every garment in interactive 3D or 360° studio sequences with live size availability."}
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="border-b border-white/10 bg-[#0A0A0A] sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 text-xs uppercase tracking-[0.18em] border whitespace-nowrap transition ${
                selectedCategory === "all"
                  ? "bg-white text-black border-white font-semibold"
                  : "border-white/15 text-ash hover:text-white"
              }`}
            >
              {locale === "uz" ? "Barchasi" : locale === "ru" ? "Все" : "All"} (
              {products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 text-xs uppercase tracking-[0.18em] border whitespace-nowrap transition ${
                  selectedCategory === cat.slug
                    ? "bg-white text-black border-white font-semibold"
                    : "border-white/15 text-ash hover:text-white"
                }`}
              >
                {getLocalizedText(cat, "name", locale)}
              </button>
            ))}
          </div>

          {/* Right Filters: Search, Size, 3D Toggle, Sort */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-stone absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  locale === "uz"
                    ? "Qidirish (nomi, SKU)..."
                    : "Поиск..."
                }
                className="w-full sm:w-48 bg-[#121215] border border-white/15 pl-8 pr-3 py-2 text-xs text-white placeholder:text-stone focus:outline-none focus:border-white"
              />
            </div>

            {/* Size Filter */}
            <div className="flex items-center border border-white/15 bg-[#121215] px-2 py-1">
              <span className="text-[10px] uppercase tracking-widest text-stone mr-2">
                Size:
              </span>
              <button
                type="button"
                onClick={() => setSelectedSize("all")}
                className={`px-1.5 py-0.5 text-[11px] font-mono ${
                  selectedSize === "all"
                    ? "bg-white text-black font-semibold"
                    : "text-stone hover:text-white"
                }`}
              >
                ALL
              </button>
              {sizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`px-1.5 py-0.5 text-[11px] font-mono ${
                    selectedSize === sz
                      ? "bg-white text-black font-semibold"
                      : "text-stone hover:text-white"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* 3D Ready Toggle */}
            <button
              type="button"
              onClick={() => setOnly3D(!only3D)}
              className={`px-3 py-2 text-xs uppercase tracking-wider border flex items-center gap-1.5 transition ${
                only3D
                  ? "bg-white text-black border-white font-semibold"
                  : "border-white/15 bg-[#121215] text-ash hover:text-white"
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Only</span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#121215] border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
            >
              <option value="newest">Yangi tushganlar</option>
              <option value="bestseller">Bestsellerlar</option>
              <option value="price_asc">Narx: Arzondan qimmatga</option>
              <option value="price_desc">Narx: Qimmatdan arzonga</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between text-xs text-stone uppercase tracking-widest mb-6">
          <span>
            Topildi: <strong className="text-white">{filteredProducts.length}</strong>{" "}
            ta model
          </span>
          {(selectedCategory !== "all" ||
            selectedSize !== "all" ||
            only3D ||
            searchQuery) && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-ash hover:text-white flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Filtrlarni tozalash</span>
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="border border-white/10 bg-[#0E0E10] py-20 text-center space-y-4">
            <Filter className="w-8 h-8 text-stone mx-auto" />
            <p className="text-sm text-ash">
              Tanlangan filtrlar bo&apos;yicha mahsulot topilmadi.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="border border-white px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition"
            >
              Barcha mahsulotlarni ko&apos;rsatish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
