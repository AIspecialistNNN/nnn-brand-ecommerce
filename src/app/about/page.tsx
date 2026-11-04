"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Box, Compass, Layers, Shield } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function AboutPage() {
  const { locale } = useStore();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F7F7F5]">
      {/* Hero Banner */}
      <section className="relative border-b border-white/10 py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-stone">
            MAISON NNN BRAND · TASHKENT & MILAN
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold uppercase tracking-[0.18em] text-white mt-4 leading-tight">
            LESS NOISE.
            <br />
            MORE IDENTITY.
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-ash leading-relaxed mt-6">
            {locale === "uz"
              ? "NNN BRAND — zamonaviy erkaklar garderobini me'moriy minimalizm, yuqori zichlikdagi tabiiy matolar va 3D raqamli texnologiyalar orqali qayta kashf etuvchi premium moda uyi."
              : locale === "ru"
              ? "NNN BRAND — дом современной мужской моды, объединяющий архитектурный минимализм, тяжелые натуральные ткани и интерактивные 3D-технологии."
              : "NNN BRAND is a contemporary men's fashion house uniting architectural tailoring, heavyweight natural textiles, and real-time 3D digital twin technology."}
          </p>
        </div>
      </section>

      {/* Architectural Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#0E0E10] border border-white/10 p-8 space-y-4">
            <Compass className="w-6 h-6 text-white" />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
              01 / Me&apos;moriy Siluet
            </h2>
            <p className="text-xs text-stone leading-relaxed">
              Har bir palto, pijak va xudi inson qomatini mukammal vertikal
              proporsiyada ko&apos;rsatish uchun konstruktiv chizmalar asosida
              yaratiladi. Ortiqcha dekor va shovqin olib tashlanadi.
            </p>
          </div>

          <div className="bg-[#0E0E10] border border-white/10 p-8 space-y-4">
            <Layers className="w-6 h-6 text-white" />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
              02 / 580–780 GSM Matolar
            </h2>
            <p className="text-xs text-stone leading-relaxed">
              Italiyaning Biella hududida to&apos;qilgan virgin jun-kaşmir hamda
              O&apos;zbekistonning eng oliy navli uzun tolali organik paxtasidan
              (580 GSM) foydalanamiz.
            </p>
          </div>

          <div className="bg-[#0E0E10] border border-white/10 p-8 space-y-4">
            <Box className="w-6 h-6 text-white" />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
              03 / 3D & 360° Raqamli Atelye
            </h2>
            <p className="text-xs text-stone leading-relaxed">
              Xaridor kiyimni buyurtma qilishdan oldin real-vaqtda 3D WebGL
              muhitida aylantirib ko&apos;rishi, mato fakturasini va ranglarini
              360° burchak ostida tekshirishi mumkin.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Story Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 aspect-[4/3] overflow-hidden border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1400&q=85"
              alt="NNN BRAND Atelier"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-stone">
              TASHKENT FLAGSHIP ATELIER
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-[0.16em] text-white">
              Toshkentdan Xalqaro Podiumgacha
            </h2>
            <p className="text-xs sm:text-sm text-ash leading-relaxed">
              Toshkent shahrining markazida joylashgan NNN BRAND eksperimental
              laboratoriyasi va flagship showroomimizda har bir kolleksiya
              cheklangan adadda (limited edition) ishlab chiqariladi.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="bg-white text-black px-7 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-ash transition inline-flex items-center gap-2"
              >
                <span>Kolleksiyani Ko&apos;rish</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="border border-white/25 px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-white hover:border-white transition"
              >
                Showroomga Yozilish
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
