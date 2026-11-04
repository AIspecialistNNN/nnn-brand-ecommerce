"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  LogOut,
  Package,
  Search,
  User,
  UserCheck,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import {
  formatUzPhoneInput,
  formatUzs,
  UZBEKISTAN_REGIONS,
} from "@/lib/i18n";

export default function AccountPage() {
  const { currentUser, setCurrentUser, users, setUsers, orders, refreshStore } =
    useStore();

  const [tab, setTab] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [loginInput, setLoginInput] = useState("javohir@client.uz");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState(UZBEKISTAN_REGIONS[0].id);
  const [address, setAddress] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [orderLookupNumber, setOrderLookupNumber] = useState("");

  const customerOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter(
      (o) =>
        o.customerPhone.replace(/\D/g, "") ===
          currentUser.phone.replace(/\D/g, "") ||
        (o.customerEmail &&
          o.customerEmail.toLowerCase() === currentUser.email.toLowerCase())
    );
  }, [currentUser, orders]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "CUSTOMER_LOGIN",
          email: loginInput.includes("@") ? loginInput : undefined,
          phone: !loginInput.includes("@") ? loginInput : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        await refreshStore();
        return;
      }
    } catch {
      // Static fallback
    } finally {
      const found = users.find(
        (u) =>
          u.email.toLowerCase() === loginInput.trim().toLowerCase() ||
          u.phone.replace(/\D/g, "") === loginInput.replace(/\D/g, "")
      );
      if (found) {
        setCurrentUser(found);
      } else {
        setErrorMsg("Profil topilmadi. Demo: javohir@client.uz");
      }
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "CUSTOMER_REGISTER",
          name,
          phone,
          email,
          region,
          address,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        await refreshStore();
        return;
      }
    } catch {
      // Static fallback
    } finally {
      const newUser = {
        id: `user-${Date.now()}`,
        email: email.trim() || "client@nnnbrand.uz",
        name: name.trim(),
        phone,
        role: "CUSTOMER" as const,
        region,
        address,
        totalSpentUzs: 0,
        ordersCount: 0,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F7F7F5] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-white/10 pb-6 mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-stone">
              NNN BRAND PRIVATE CLIENT PORTAL
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-[0.18em] text-white mt-2">
              Mijoz Kabineti va Buyurtmalar Tarixi
            </h1>
          </div>

          {currentUser && (
            <button
              type="button"
              onClick={() => setCurrentUser(null)}
              className="border border-white/20 px-4 py-2 text-xs uppercase tracking-widest text-ash hover:text-white flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Chiqish</span>
            </button>
          )}
        </div>

        {!currentUser ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-6 bg-[#0E0E10] border border-white/15 p-6 sm:p-8 space-y-6">
              <div className="flex border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setTab("LOGIN")}
                  className={`pb-3 px-4 text-xs uppercase tracking-[0.2em] border-b-2 transition ${
                    tab === "LOGIN"
                      ? "border-white text-white font-semibold"
                      : "border-transparent text-stone"
                  }`}
                >
                  Kirish
                </button>
                <button
                  type="button"
                  onClick={() => setTab("REGISTER")}
                  className={`pb-3 px-4 text-xs uppercase tracking-[0.2em] border-b-2 transition ${
                    tab === "REGISTER"
                      ? "border-white text-white font-semibold"
                      : "border-transparent text-stone"
                  }`}
                >
                  Ro&apos;yxatdan o&apos;tish
                </button>
              </div>

              {tab === "LOGIN" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone mb-1.5">
                      Email yoki Telefon raqami (+998)
                    </label>
                    <input
                      type="text"
                      required
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      placeholder="javohir@client.uz yoki +998 90 945 77 12"
                      className="w-full bg-[#141418] border border-white/15 px-3.5 py-3 text-xs text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="bg-white/[0.03] border border-white/10 p-3 text-[11px] text-stone space-y-1">
                    <div className="text-ash font-semibold">
                      Tayyor demo mijoz akkauntlari:
                    </div>
                    <div>• javohir@client.uz (+998 90 945 77 12)</div>
                    <div>• bekzod.karimov@uzcard.uz (+998 93 512 88 90)</div>
                  </div>

                  {errorMsg && (
                    <div className="text-xs text-red-400">{errorMsg}</div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-black py-3.5 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-ash transition"
                  >
                    {loading ? "Tekshirilmoqda..." : "Kabinetga Kirish"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone mb-1">
                      Ism va Familiya *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#141418] border border-white/15 px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone mb-1">
                      Telefon (+998) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) =>
                        setPhone(formatUzPhoneInput(e.target.value))
                      }
                      className="w-full bg-[#141418] border border-white/15 px-3.5 py-2.5 text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#141418] border border-white/15 px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone mb-1">
                      Viloyat / Shahar
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full bg-[#141418] border border-white/15 px-3.5 py-2.5 text-xs text-white"
                    >
                      {UZBEKISTAN_REGIONS.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nameUz}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone mb-1">
                      Manzil
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#141418] border border-white/15 px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>

                  {errorMsg && (
                    <div className="text-xs text-red-400">{errorMsg}</div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-black py-3.5 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-ash transition"
                  >
                    Ro&apos;yxatdan O&apos;tish
                  </button>
                </form>
              )}
            </div>

            {/* Right: Instant Order Status Lookup */}
            <div className="lg:col-span-6 bg-[#0E0E10] border border-white/10 p-6 sm:p-8 space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                Buyurtma Raqami Bo&apos;yicha Tekshirish
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={orderLookupNumber}
                  onChange={(e) => setOrderLookupNumber(e.target.value)}
                  placeholder="Masalan: NNN-26101"
                  className="flex-1 bg-[#141418] border border-white/15 px-3.5 py-2.5 text-xs font-mono text-white uppercase"
                />
              </div>

              <div className="space-y-4">
                {orders
                  .filter((o) =>
                    orderLookupNumber.trim()
                      ? o.orderNumber
                          .toLowerCase()
                          .includes(orderLookupNumber.trim().toLowerCase())
                      : true
                  )
                  .slice(0, 3)
                  .map((ord) => (
                    <div
                      key={ord.id}
                      className="border border-white/10 bg-[#131317] p-4 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white">
                          #{ord.orderNumber}
                        </span>
                        <span className="px-2 py-0.5 border border-white/20 text-[10px] font-mono uppercase">
                          {ord.status}
                        </span>
                      </div>
                      <div className="text-stone">
                        {ord.customerName} · {ord.region}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-white/10 font-mono">
                        <span className="text-ash">{ord.paymentMethod}</span>
                        <span className="text-white font-semibold">
                          {formatUzs(ord.totalUzs)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Customer Profile Summary */}
            <div className="lg:col-span-4">
              <div className="bg-[#0E0E10] border border-white/15 p-6 space-y-4">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="w-11 h-11 bg-white text-black flex items-center justify-center font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {currentUser.name}
                    </div>
                    <div className="text-xs font-mono text-stone">
                      {currentUser.phone}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone">Email:</span>
                    <span className="text-white">{currentUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Hudud:</span>
                    <span className="text-white">
                      {currentUser.region || "Toshkent shahri"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Manzil:</span>
                    <span className="text-white text-right">
                      {currentUser.address || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Order History */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                Buyurtmalar Tarixi ({customerOrders.length})
              </h2>

              {customerOrders.length === 0 ? (
                <div className="bg-[#0E0E10] border border-white/10 p-12 text-center space-y-3">
                  <Package className="w-8 h-8 text-stone mx-auto" />
                  <p className="text-xs text-stone">
                    Sizda hozircha buyurtmalar mavjud emas.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-block border border-white px-5 py-2 text-xs uppercase tracking-widest"
                  >
                    Xaridni boshlash
                  </Link>
                </div>
              ) : (
                customerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-[#0E0E10] border border-white/15 p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <span className="text-sm font-mono font-bold text-white">
                          Buyurtma #{ord.orderNumber}
                        </span>
                        <span className="block text-[11px] text-stone">
                          Sana:{" "}
                          {new Date(ord.createdAt).toLocaleDateString("ru-RU")} ·{" "}
                          {ord.region}, {ord.district}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 border border-white/20 text-[10px] font-mono uppercase">
                          {ord.paymentMethod}: {ord.paymentStatus}
                        </span>
                        <span className="px-2.5 py-1 bg-white text-black text-[10px] font-mono font-bold uppercase">
                          {ord.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {ord.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-ash">
                            {item.nameUz} ({item.colorName} / {item.size}) ×{" "}
                            {item.quantity}
                          </span>
                          <span className="font-mono text-white">
                            {formatUzs(item.unitPriceUzs * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs font-bold">
                      <span>JAMI:</span>
                      <span className="font-mono text-sm text-white">
                        {formatUzs(ord.totalUzs)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
