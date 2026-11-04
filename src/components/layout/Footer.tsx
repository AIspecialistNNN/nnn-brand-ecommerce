"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";

export default function Footer() {
  const { locale } = useStore();

  return (
    <footer className="bg-[#08080A] border-t border-white/10 text-stone">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand Identity */}
          <div className="space-y-4">
            <div className="text-2xl font-bold tracking-[0.28em] text-white">
              NNN BRAND
            </div>
            <p className="text-xs uppercase tracking-[0.22em] text-ash">
              &ldquo;Less Noise. More Identity.&rdquo;
            </p>
            <p className="text-xs leading-relaxed text-stone">
              {locale === "uz"
                ? "Zamonaviy erkaklar uchun me'moriy minimalizm, premium matolar va real-vaqtda 3D raqamli garderob tajribasi."
                : locale === "ru"
                ? "Архитектурный минимализм для современных мужчин, премиальные ткани и интерактивный 3D-гардероб."
                : "Contemporary architectural menswear crafted with Italian & Uzbek luxury textiles and real-time 3D digital twin technology."}
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-white">
              {locale === "uz"
                ? "Navigatsiya"
                : locale === "ru"
                ? "Навигация"
                : "Navigation"}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop" className="hover:text-white transition">
                  {locale === "uz"
                    ? "Barcha Kolleksiyalar"
                    : locale === "ru"
                    ? "Все Коллекции"
                    : "All Collections"}
                </Link>
              </li>
              <li>
                <Link
                  href="/product/monolith-wool-overcoat"
                  className="hover:text-white transition"
                >
                  3D Interactive Studio
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">
                  {locale === "uz"
                    ? "Brend Falsafasi"
                    : locale === "ru"
                    ? "О Бренде"
                    : "About Maison"}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  {locale === "uz"
                    ? "Showroom & Aloqa"
                    : locale === "ru"
                    ? "Шоурум и Контакты"
                    : "Showroom & Contact"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Client Services */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-white">
              {locale === "uz"
                ? "Mijozlar Xizmati"
                : locale === "ru"
                ? "Клиентский Сервис"
                : "Client Services"}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/account" className="hover:text-white transition">
                  {locale === "uz"
                    ? "Shaxsiy kabinet va buyurtmalar"
                    : locale === "ru"
                    ? "Личный кабинет и заказы"
                    : "Client Account & Orders"}
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-white transition">
                  {locale === "uz"
                    ? "Tanlangan modellar"
                    : locale === "ru"
                    ? "Избранные модели"
                    : "Saved Wishlist"}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition">
                  {locale === "uz"
                    ? "Xarid savati"
                    : locale === "ru"
                    ? "Корзина покупок"
                    : "Shopping Bag"}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Tashkent Flagship Atelier */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-white">
              Tashkent Flagship Showroom
            </h3>
            <p className="text-xs leading-relaxed">
              Toshkent sh., Mirobod tumani, Taras Shevchenko ko&apos;chasi, 21-uy
              <br />
              Har kuni: 10:00 — 22:00
            </p>
            <p className="text-xs font-mono text-white">+998 78 113 99 00</p>
            <div className="pt-2 flex flex-wrap gap-2">
              <span className="border border-white/15 px-2.5 py-1 text-[10px] font-mono uppercase text-ash">
                CLICK
              </span>
              <span className="border border-white/15 px-2.5 py-1 text-[10px] font-mono uppercase text-ash">
                PAYME
              </span>
              <span className="border border-white/15 px-2.5 py-1 text-[10px] font-mono uppercase text-ash">
                UZCARD
              </span>
              <span className="border border-white/15 px-2.5 py-1 text-[10px] font-mono uppercase text-ash">
                HUMO
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] uppercase tracking-widest">
          <span>
            © {new Date().getFullYear()} NNN BRAND ATELIER. ALL RIGHTS RESERVED.
          </span>
          <span>UZS · O&apos;ZBEKISTON RESPUBLIKASI</span>
        </div>
      </div>
    </footer>
  );
}
