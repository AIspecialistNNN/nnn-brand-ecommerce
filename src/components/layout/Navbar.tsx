"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Heart,
  Menu,
  ShieldCheck,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { DICTIONARY } from "@/lib/i18n";
import { Locale } from "@/lib/types";

export default function Navbar() {
  const pathname = usePathname();
  const {
    locale,
    setLocale,
    cartCount,
    wishlistIds,
    setIsCartDrawerOpen,
    currentUser,
  } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = DICTIONARY[locale].nav;

  const navLinks = [
    { href: "/", label: t.home },
    { href: "/shop", label: t.shop },
    { href: "/product/monolith-wool-overcoat", label: t.studio3d, is3d: true },
    { href: "/about", label: t.about },
    { href: "/contact", label: t.contact },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/10">
      {/* Top Announcement Bar */}
      <div className="bg-[#121214] border-b border-white/5 px-4 py-1.5 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-stone flex items-center justify-between">
        <span className="hidden md:inline">
          NNN BRAND — &ldquo;LESS NOISE. MORE IDENTITY.&rdquo;
        </span>
        <span className="mx-auto md:mx-0 text-ash">
          {locale === "uz"
            ? "Toshkent bo'ylab 2-3 soatda VIP yetkazib berish · Click & Payme"
            : locale === "ru"
            ? "VIP доставка по Ташкенту за 2-3 часа · Click & Payme"
            : "Tashkent 2-3 Hour VIP Courier · Click & Payme Ready"}
        </span>
        <Link
          href="/admin"
          className="hidden sm:inline-flex items-center gap-1 text-stone hover:text-white transition"
        >
          <ShieldCheck className="w-3 h-3" />
          <span>{t.admin}</span>
        </Link>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Mobile Menu Button + Brand Wordmark */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-ash hover:text-white"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <Link href="/" className="group flex flex-col">
            <span className="text-xl sm:text-2xl font-bold tracking-[0.28em] text-white">
              NNN BRAND
            </span>
            <span className="text-[9px] tracking-[0.26em] text-stone uppercase -mt-1">
              Tashkent · Milan
            </span>
          </Link>
        </div>

        {/* Center: Desktop Editorial Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs uppercase tracking-[0.2em] transition flex items-center gap-1.5 py-1 border-b ${
                  active
                    ? "text-white border-white font-medium"
                    : "text-stone border-transparent hover:text-white"
                }`}
              >
                {item.is3d && <Box className="w-3.5 h-3.5 text-white" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Language Switcher + Utility Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Switcher (UZ | RU | EN) */}
          <div className="flex items-center border border-white/15 bg-white/[0.03] px-1 py-0.5 text-[10px] tracking-widest uppercase">
            {(["uz", "ru", "en"] as Locale[]).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocale(loc)}
                className={`px-2 py-1 transition ${
                  locale === loc
                    ? "bg-white text-black font-semibold"
                    : "text-stone hover:text-white"
                }`}
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative p-2 text-ash hover:text-white transition"
            title={t.wishlist}
          >
            <Heart className="w-5 h-5" />
            {wishlistIds.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                {wishlistIds.length}
              </span>
            )}
          </Link>

          {/* Account */}
          <Link
            href="/account"
            className="p-2 text-ash hover:text-white transition flex items-center gap-1.5"
            title={t.account}
          >
            <User className="w-5 h-5" />
            {currentUser && (
              <span className="hidden xl:inline text-[11px] tracking-wider uppercase text-white max-w-[90px] truncate">
                {currentUser.name.split(" ")[0]}
              </span>
            )}
          </Link>

          {/* Shopping Bag Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative flex items-center gap-2 bg-white text-black px-3.5 py-2 text-xs uppercase tracking-[0.18em] font-medium hover:bg-ash transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">{t.cart}</span>
            <span className="font-mono text-xs">({cartCount})</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0E0E10] border-b border-white/15 px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm uppercase tracking-[0.2em] text-white py-2 border-b border-white/10 flex items-center justify-between"
              >
                <span>{item.label}</span>
                {item.is3d && (
                  <span className="text-[10px] bg-white text-black px-2 py-0.5 font-mono">
                    3D LIVE
                  </span>
                )}
              </Link>
            ))}
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase tracking-[0.2em] text-ash py-2 border-b border-white/10"
            >
              {t.cart} ({cartCount})
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase tracking-[0.2em] text-stone py-2 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t.admin}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
