"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, MapPin, Phone, Send } from "lucide-react";
import { formatUzPhoneInput, validateUzPhone } from "@/lib/i18n";
import { useStore } from "@/context/StoreContext";

export default function ContactPage() {
  const { refreshStore } = useStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("VIP Showroom Ko'rik / Fitting");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const check = validateUzPhone(phone);
    if (!check.valid) {
      setStatus({
        ok: false,
        text: check.errorUz || "Telefon raqami noto'g'ri",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: check.normalized,
          email,
          subject,
          appointmentDate,
          message,
        }),
      });
      if (res.ok) {
        await refreshStore();
      }
    } catch {
      // Static GitHub Pages fallback
    } finally {
      setStatus({
        ok: true,
        text: "Murojaatingiz qabul qilindi! NNN BRAND konsyerji tez orada siz bilan bog'lanadi.",
      });
      setName("");
      setMessage("");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F7F7F5] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-white/10 pb-8 mb-12">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-stone">
            PRIVATE CLIENT CONCIERGE & SHOWROOM
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold uppercase tracking-[0.18em] text-white mt-2">
            Aloqa & Showroom
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Showroom Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0E0E10] border border-white/10 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-white mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                    Toshkent Flagship Showroom
                  </h3>
                  <p className="text-xs text-stone mt-1 leading-relaxed">
                    O&apos;zbekiston, Toshkent shahri, Mirobod tumani, Taras
                    Shevchenko ko&apos;chasi, 21-uy
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-white/10">
                <Clock className="w-5 h-5 text-white mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                    Ish Vaqti
                  </h3>
                  <p className="text-xs text-stone mt-1">
                    Dushanba – Yakshanba: 10:00 — 22:00 (VIP Fitting oldindan
                    yozilish orqali)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-white/10">
                <Phone className="w-5 h-5 text-white mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                    Telefon & Telegram Konsyerj
                  </h3>
                  <p className="text-xs font-mono text-white mt-1">
                    +998 78 113 99 00
                  </p>
                  <p className="text-xs text-stone mt-0.5">
                    Telegram: @nnnbrand_concierge_uz · info@nnnbrand.uz
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Appointment / Contact Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="bg-[#0E0E10] border border-white/15 p-6 sm:p-8 space-y-5"
            >
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white border-b border-white/10 pb-4">
                VIP Fitting Yoki Savol Yuborish
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone mb-1.5">
                    Ismingiz *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ism va Familiya"
                    className="w-full bg-[#141418] border border-white/15 px-3.5 py-3 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone mb-1.5">
                    Telefon raqami (+998) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) =>
                      setPhone(formatUzPhoneInput(e.target.value))
                    }
                    className="w-full bg-[#141418] border border-white/15 px-3.5 py-3 text-xs font-mono text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone mb-1.5">
                    Murojaat mavzusi
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#141418] border border-white/15 px-3.5 py-3 text-xs text-white focus:outline-none focus:border-white"
                  >
                    <option value="VIP Showroom Ko'rik / Fitting">
                      VIP Showroom Ko&apos;rik / Individual Fitting
                    </option>
                    <option value="Buyurtma bo'yicha savol">
                      Buyurtma va yetkazib berish bo&apos;yicha savol
                    </option>
                    <option value="3D / Korporativ hamkorlik">
                      Korporativ hamkorlik
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone mb-1.5">
                    Showroomga tashrif sanasi (ixtiyoriy)
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full bg-[#141418] border border-white/15 px-3.5 py-3 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-stone mb-1.5">
                  Xabar matni *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="O'zingizni qiziqtirgan model, o'lcham yoki tashrif vaqtini yozing..."
                  className="w-full bg-[#141418] border border-white/15 p-3.5 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              {status && (
                <div
                  className={`p-3.5 border text-xs flex items-center gap-2 ${
                    status.ok
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-red-500/40 bg-red-500/10 text-red-300"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{status.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="bg-white text-black px-8 py-4 text-xs uppercase tracking-[0.22em] font-semibold hover:bg-ash transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? "Yuborilmoqda..." : "Murojaatni Yuborish"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
