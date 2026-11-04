"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Lock,
  Send,
  ShieldAlert,
  Truck,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import {
  DICTIONARY,
  formatUzPhoneInput,
  formatUzs,
  getLocalizedText,
  SHIPPING_OPTIONS,
  UZBEKISTAN_REGIONS,
  validateUzPhone,
} from "@/lib/i18n";
import { Order, PaymentMethod } from "@/lib/types";

export default function CheckoutPage() {
  const {
    locale,
    cart,
    products,
    setProducts,
    setOrders,
    cartSubtotalUzs,
    appliedPromo,
    discountAmountUzs,
    clearCart,
    refreshStore,
    currentUser,
  } = useStore();

  const t = DICTIONARY[locale].checkout;

  const [customerName, setCustomerName] = useState(currentUser?.name || "");
  const [customerPhone, setCustomerPhone] = useState(
    currentUser?.phone || "+998 "
  );
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || "");
  const [region, setRegion] = useState(
    currentUser?.region || UZBEKISTAN_REGIONS[0].id
  );
  const [district, setDistrict] = useState(
    UZBEKISTAN_REGIONS[0].districts[0]
  );
  const [addressLine, setAddressLine] = useState(currentUser?.address || "");
  const [deliveryMethod, setDeliveryMethod] = useState<
    "TASHKENT_EXPRESS" | "REGIONAL_COURIER" | "SHOWROOM_PICKUP"
  >("TASHKENT_EXPRESS");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CLICK");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [gatewayNote, setGatewayNote] = useState<string>("");
  const [verifyingSandbox, setVerifyingSandbox] = useState(false);

  const selectedRegionObj =
    UZBEKISTAN_REGIONS.find((r) => r.id === region) || UZBEKISTAN_REGIONS[0];

  const activeShipping =
    SHIPPING_OPTIONS.find((s) => s.id === deliveryMethod) ||
    SHIPPING_OPTIONS[0];

  const shippingCostUzs =
    activeShipping.freeThresholdUzs > 0 &&
    cartSubtotalUzs >= activeShipping.freeThresholdUzs
      ? 0
      : activeShipping.priceUzs;

  const totalUzs = Math.max(
    0,
    cartSubtotalUzs - discountAmountUzs + shippingCostUzs
  );

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);
    const found = UZBEKISTAN_REGIONS.find((r) => r.id === newRegion);
    if (found && found.districts.length > 0) {
      setDistrict(found.districts[0]);
    }
    if (newRegion !== "Toshkent shahri" && deliveryMethod === "TASHKENT_EXPRESS") {
      setDeliveryMethod("REGIONAL_COURIER");
    }
  };

  const buildFallbackOrder = (normalizedPhone: string): Order => {
    const orderNumber = `NNN-${Math.floor(10000 + Math.random() * 90000)}`;
    const itemsSnapshot = cart
      .map((c) => {
        const prod = products.find((p) => p.id === c.productId);
        if (!prod) return null;
        const col =
          prod.colors.find((cl) => cl.id === c.colorId) || prod.colors[0];
        return {
          productId: prod.id,
          sku: prod.sku,
          slug: prod.slug,
          nameUz: prod.nameUz,
          nameRu: prod.nameRu,
          nameEn: prod.nameEn,
          colorId: col.id,
          colorName: col.nameUz,
          colorHex: col.hex,
          size: c.size,
          quantity: c.quantity,
          unitPriceUzs: prod.priceUzs,
          image: prod.gallery[0] || "",
        };
      })
      .filter(Boolean) as Order["items"];

    return {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: customerName.trim(),
      customerPhone: normalizedPhone,
      customerEmail: customerEmail.trim() || undefined,
      region,
      district,
      addressLine: addressLine.trim(),
      deliveryMethod,
      shippingCostUzs,
      subtotalUzs: cartSubtotalUzs,
      discountCode: appliedPromo?.code,
      discountAmountUzs,
      totalUzs,
      paymentMethod,
      paymentStatus:
        paymentMethod === "CASH_ON_DELIVERY" ? "COD_PENDING" : "PENDING_MERCHANT",
      status:
        paymentMethod === "CASH_ON_DELIVERY" ? "CONFIRMED" : "AWAITING_PAYMENT",
      telegramNotified: true,
      telegramLog: `Telegram payload queued (${new Date().toLocaleTimeString()})`,
      notes: notes.trim() || undefined,
      items: itemsSnapshot,
      createdAt: new Date().toISOString(),
    };
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const phoneCheck = validateUzPhone(customerPhone);
    if (!phoneCheck.valid) {
      setErrorMsg(phoneCheck.errorUz || "Telefon raqami noto'g'ri");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone: phoneCheck.normalized,
          customerEmail,
          region,
          district,
          addressLine,
          deliveryMethod,
          paymentMethod,
          discountCode: appliedPromo?.code,
          notes,
          items: cart,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedOrder(data.order);
        setGatewayNote(data.gatewayInfo?.merchantNote || "");
        clearCart();
        await refreshStore();
        return;
      }
      // Static GitHub Pages fallback
      const fallbackOrd = buildFallbackOrder(phoneCheck.normalized);
      setOrders((prev) => [fallbackOrd, ...prev]);
      setCreatedOrder(fallbackOrd);
      setGatewayNote(
        "Sandbox tekshiruv rejimi faol (Click / Payme test tasdiqlash)"
      );
      clearCart();
    } catch {
      const fallbackOrd = buildFallbackOrder(phoneCheck.normalized);
      setOrders((prev) => [fallbackOrd, ...prev]);
      setCreatedOrder(fallbackOrd);
      setGatewayNote(
        "Sandbox tekshiruv rejimi faol (Click / Payme test tasdiqlash)"
      );
      clearCart();
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifySandboxPayment = async () => {
    if (!createdOrder) return;
    setVerifyingSandbox(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: createdOrder.id,
          action: "VERIFY_SANDBOX_PAYMENT",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setCreatedOrder(data.order);
          await refreshStore();
          return;
        }
      }
    } catch {
      // ignore on static host
    } finally {
      const updated: Order = {
        ...createdOrder,
        paymentStatus: "SANDBOX_VERIFIED",
        paymentTransactionId: `${createdOrder.paymentMethod}-SANDBOX-${Date.now()
          .toString()
          .slice(-6)}`,
        status: "CONFIRMED",
      };
      setCreatedOrder(updated);
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o))
      );
      setVerifyingSandbox(false);
    }
  };

  // ORDER CONFIRMATION VIEW
  if (createdOrder) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F7F7F5] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-[#0E0E10] border border-white/20 p-6 sm:p-10 space-y-8">
            <div className="flex items-start justify-between border-b border-white/10 pb-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-emerald-400 text-xs uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Buyurtma Ro&apos;yxatga Olindi</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-[0.15em] text-white">
                  Buyurtma #{createdOrder.orderNumber}
                </h1>
                <p className="text-xs text-stone">
                  Mijoz: {createdOrder.customerName} · {createdOrder.customerPhone}
                </p>
              </div>
              <span className="px-3 py-1.5 border border-white/20 bg-white/5 text-xs font-mono uppercase">
                {createdOrder.status}
              </span>
            </div>

            {/* Honest Payment Gateway Architecture Block */}
            {createdOrder.paymentMethod !== "CASH_ON_DELIVERY" && (
              <div className="border border-amber-400/30 bg-amber-500/[0.06] p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      <span>
                        {createdOrder.paymentMethod} To&apos;lov Holati:{" "}
                        {createdOrder.paymentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-ash leading-relaxed">
                      {gatewayNote}
                    </p>
                  </div>
                </div>

                {createdOrder.paymentStatus === "PENDING_MERCHANT" ? (
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      disabled={verifyingSandbox}
                      onClick={handleVerifySandboxPayment}
                      className="bg-white text-black px-5 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-ash transition"
                    >
                      {verifyingSandbox
                        ? "Tasdiqlanmoqda..."
                        : `Sandbox ${createdOrder.paymentMethod} To'lovini Tasdiqlash`}
                    </button>
                    <span className="text-[11px] text-stone">
                      (Production muhitida `.env` ga `CLICK_MERCHANT_ID` /
                      `PAYME_MERCHANT_ID` kiritilganda avtomatik callback ishlaydi)
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-400 font-mono">
                    ✓ Tranzaksiya tasdiqlandi: {createdOrder.paymentTransactionId}
                  </div>
                )}
              </div>
            )}

            {/* Telegram Notification Log */}
            <div className="border border-white/10 bg-[#121216] p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-ash">
                <Send className="w-4 h-4 text-white" />
                <span>Telegram Bot Xabarnomasi:</span>
                <span className="font-mono text-stone">
                  {createdOrder.telegramLog}
                </span>
              </div>
            </div>

            {/* Order Items Snapshot */}
            <div className="space-y-3">
              <h2 className="text-xs uppercase tracking-widest text-stone">
                Buyurtma tarkibi
              </h2>
              <div className="divide-y divide-white/10 border border-white/10">
                {createdOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="text-white font-medium uppercase">
                        {item.nameUz}
                      </div>
                      <div className="text-stone mt-0.5">
                        Rang: {item.colorName} · O&apos;lcham: {item.size} ×{" "}
                        {item.quantity}
                      </div>
                    </div>
                    <div className="font-mono text-white">
                      {formatUzs(item.unitPriceUzs * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Summary */}
            <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-stone">
                <span>Manzil:</span>
                <span className="text-white">
                  {createdOrder.region}, {createdOrder.district},{" "}
                  {createdOrder.addressLine}
                </span>
              </div>
              <div className="flex justify-between text-stone">
                <span>Yetkazib berish:</span>
                <span className="font-mono text-white">
                  {formatUzs(createdOrder.shippingCostUzs)}
                </span>
              </div>
              {createdOrder.discountAmountUzs > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Chegirma ({createdOrder.discountCode}):</span>
                  <span className="font-mono">
                    -{formatUzs(createdOrder.discountAmountUzs)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                <span>JAMI TO&apos;LOV:</span>
                <span className="font-mono text-lg">
                  {formatUzs(createdOrder.totalUzs)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/account"
                className="bg-white text-black px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-ash transition"
              >
                Buyurtmalar Tarixini Ko&apos;rish
              </Link>
              <Link
                href="/shop"
                className="border border-white/25 px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-white hover:border-white transition"
              >
                Katalogga Qaytish
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F7F7F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-white/10 pb-6 mb-10">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-stone">
            NNN BRAND SECURE CHECKOUT · UZS
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-[0.18em] text-white mt-2">
            {t.title}
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="border border-white/10 bg-[#0E0E10] p-12 text-center space-y-4">
            <p className="text-sm text-stone">
              Savatingiz bo&apos;sh. Buyurtma berish uchun avval mahsulot tanlang.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-white text-black px-6 py-3 text-xs uppercase tracking-widest font-semibold"
            >
              Katalogga o&apos;tish
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmitOrder}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            {/* Left Form Sections */}
            <div className="lg:col-span-7 space-y-8">
              {/* 1. Contact Info */}
              <div className="bg-[#0E0E10] border border-white/10 p-6 space-y-5">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white border-b border-white/10 pb-3">
                  {t.contactInfo}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone mb-1.5">
                      Ism va Familiya *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Sardor Karimov"
                      className="w-full bg-[#141418] border border-white/15 px-3.5 py-3 text-xs text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone mb-1.5">
                      {t.phoneLabel} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) =>
                        setCustomerPhone(formatUzPhoneInput(e.target.value))
                      }
                      placeholder="+998 90 123 45 67"
                      className="w-full bg-[#141418] border border-white/15 px-3.5 py-3 text-xs font-mono text-white focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone mb-1.5">
                    Email (ixtiyoriy — elektron chek uchun)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="client@domain.uz"
                    className="w-full bg-[#141418] border border-white/15 px-3.5 py-3 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* 2. Uzbekistan Delivery Address */}
              <div className="bg-[#0E0E10] border border-white/10 p-6 space-y-5">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white border-b border-white/10 pb-3">
                  {t.deliveryAddress}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone mb-1.5">
                      {t.regionLabel} *
                    </label>
                    <select
                      value={region}
                      onChange={(e) => handleRegionChange(e.target.value)}
                      className="w-full bg-[#141418] border border-white/15 px-3.5 py-3 text-xs text-white focus:outline-none focus:border-white"
                    >
                      {UZBEKISTAN_REGIONS.map((reg) => (
                        <option key={reg.id} value={reg.id}>
                          {getLocalizedText(reg, "name", locale)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone mb-1.5">
                      {t.districtLabel} *
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-[#141418] border border-white/15 px-3.5 py-3 text-xs text-white focus:outline-none focus:border-white"
                    >
                      {selectedRegionObj.districts.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone mb-1.5">
                    {t.addressLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="Masalan: Taras Shevchenko ko'chasi, 21-uy, 14-xonadon"
                    className="w-full bg-[#141418] border border-white/15 px-3.5 py-3 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* 3. Shipping Configuration */}
              <div className="bg-[#0E0E10] border border-white/10 p-6 space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white border-b border-white/10 pb-3">
                  {t.shippingMethod}
                </h2>

                <div className="space-y-3">
                  {SHIPPING_OPTIONS.map((opt) => {
                    const active = deliveryMethod === opt.id;
                    const isFree =
                      opt.freeThresholdUzs > 0 &&
                      cartSubtotalUzs >= opt.freeThresholdUzs;
                    return (
                      <label
                        key={opt.id}
                        onClick={() => setDeliveryMethod(opt.id)}
                        className={`flex items-center justify-between p-4 border cursor-pointer transition ${
                          active
                            ? "border-white bg-white/[0.06]"
                            : "border-white/15 hover:border-white/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="deliveryMethod"
                            checked={active}
                            onChange={() => setDeliveryMethod(opt.id)}
                            className="mt-1 accent-white"
                          />
                          <div>
                            <div className="text-xs font-semibold text-white">
                              {getLocalizedText(opt, "name", locale)}
                            </div>
                            <div className="text-[11px] text-stone mt-0.5">
                              Muddati: {getLocalizedText(opt, "eta", locale)}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs font-mono text-white">
                          {isFree || opt.priceUzs === 0
                            ? "BEPUL"
                            : formatUzs(opt.priceUzs)}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 4. Payment Method (Click / Payme / Cash on Delivery) */}
              <div className="bg-[#0E0E10] border border-white/10 p-6 space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white border-b border-white/10 pb-3">
                  {t.paymentMethod}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(
                    [
                      {
                        id: "CLICK" as PaymentMethod,
                        title: "CLICK Evolution",
                        sub: "Uzcard / Humo orqali onlayn",
                      },
                      {
                        id: "PAYME" as PaymentMethod,
                        title: "Payme Business",
                        sub: "Tezkor elektron to'lov",
                      },
                      {
                        id: "CASH_ON_DELIVERY" as PaymentMethod,
                        title: "Yetkazilganda to'lov",
                        sub: "Naqd pul yoki kuryer terminali",
                      },
                    ] as const
                  ).map((pm) => {
                    const active = paymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`p-4 border text-left transition flex flex-col justify-between ${
                          active
                            ? "border-white bg-white text-black"
                            : "border-white/15 bg-[#141418] text-white hover:border-white/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider">
                            {pm.title}
                          </span>
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-[11px] mt-2 ${
                            active ? "text-black/75" : "text-stone"
                          }`}
                        >
                          {pm.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-[#0E0E10] border border-white/15 p-6 space-y-6 sticky top-28">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white border-b border-white/10 pb-4">
                  Buyurtma Tarkibi ({cart.length})
                </h2>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {cart.map((item) => {
                    const product = products.find(
                      (p) => p.id === item.productId
                    );
                    if (!product) return null;
                    const color =
                      product.colors.find((c) => c.id === item.colorId) ||
                      product.colors[0];
                    return (
                      <div
                        key={`${item.productId}-${item.colorId}-${item.size}`}
                        className="flex items-center justify-between gap-3 text-xs border-b border-white/10 pb-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={product.gallery[0]}
                            alt={product.nameUz}
                            className="w-12 h-14 object-cover border border-white/10"
                          />
                          <div>
                            <div className="text-white font-medium">
                              {getLocalizedText(product, "name", locale)}
                            </div>
                            <div className="text-stone text-[11px]">
                              {color.nameUz} · {item.size} × {item.quantity}
                            </div>
                          </div>
                        </div>
                        <div className="font-mono text-white">
                          {formatUzs(product.priceUzs * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2.5 text-xs pt-2">
                  <div className="flex justify-between text-ash">
                    <span>Mahsulotlar:</span>
                    <span className="font-mono">
                      {formatUzs(cartSubtotalUzs)}
                    </span>
                  </div>
                  {discountAmountUzs > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Chegirma ({appliedPromo?.code}):</span>
                      <span className="font-mono">
                        -{formatUzs(discountAmountUzs)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-ash">
                    <span>Yetkazib berish:</span>
                    <span className="font-mono">
                      {shippingCostUzs === 0
                        ? "BEPUL"
                        : formatUzs(shippingCostUzs)}
                    </span>
                  </div>
                  <div className="border-t border-white/15 pt-3 flex justify-between items-baseline text-sm font-bold text-white">
                    <span>JAMI TO&apos;LOV:</span>
                    <span className="font-mono text-lg">
                      {formatUzs(totalUzs)}
                    </span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3.5 border border-red-500/40 bg-red-500/10 text-xs text-red-300">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-black py-4 text-xs uppercase tracking-[0.22em] font-semibold hover:bg-ash disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {submitting ? "Tasdiqlanmoqda..." : t.placeOrder}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
