import { NextRequest, NextResponse } from "next/server";
import {
  buildUzPaymentGatewayUrl,
  readDb,
  sendTelegramOrderAlert,
  writeDb,
} from "@/lib/db";
import { SHIPPING_OPTIONS, validateUzPhone } from "@/lib/i18n";
import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  SizeCode,
} from "@/lib/types";

export async function GET(req: NextRequest) {
  const db = readDb();
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");
  const email = searchParams.get("email");
  const orderNumber = searchParams.get("orderNumber");

  if (orderNumber) {
    const found = db.orders.find(
      (o) => o.orderNumber.toUpperCase() === orderNumber.toUpperCase()
    );
    return NextResponse.json({ order: found || null });
  }

  if (phone || email) {
    const filtered = db.orders.filter(
      (o) =>
        (phone &&
          o.customerPhone.replace(/\D/g, "") === phone.replace(/\D/g, "")) ||
        (email &&
          o.customerEmail?.toLowerCase() === email.trim().toLowerCase())
    );
    return NextResponse.json({ orders: filtered });
  }

  return NextResponse.json({ orders: db.orders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      region,
      district,
      addressLine,
      deliveryMethod,
      paymentMethod,
      discountCode,
      notes,
      items,
    } = body as {
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      region: string;
      district: string;
      addressLine: string;
      deliveryMethod: "TASHKENT_EXPRESS" | "REGIONAL_COURIER" | "SHOWROOM_PICKUP";
      paymentMethod: PaymentMethod;
      discountCode?: string;
      notes?: string;
      items: {
        productId: string;
        colorId: string;
        size: SizeCode;
        quantity: number;
      }[];
    };

    if (!customerName || customerName.trim().length < 2) {
      return NextResponse.json(
        { error: "Iltimos, to'liq ism va familiyangizni kiriting." },
        { status: 400 }
      );
    }

    const phoneValidation = validateUzPhone(customerPhone || "");
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { error: phoneValidation.errorUz || "Telefon raqami noto'g'ri." },
        { status: 400 }
      );
    }

    if (!region || !district || !addressLine || addressLine.trim().length < 4) {
      return NextResponse.json(
        { error: "Yetkazib berish viloyati, tumani va aniq manzilni kiriting." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Savatingiz bo'sh." },
        { status: 400 }
      );
    }

    const db = readDb();
    const validatedItems: OrderItem[] = [];
    let subtotalUzs = 0;

    // 1. Validate inventory for every item on the server
    for (const reqItem of items) {
      const product = db.products.find((p) => p.id === reqItem.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Mahsulot topilmadi (${reqItem.productId})` },
          { status: 400 }
        );
      }

      const sizeEntry = product.sizes.find((s) => s.size === reqItem.size);
      if (!sizeEntry) {
        return NextResponse.json(
          { error: `${product.nameUz} uchun ${reqItem.size} o'lcham mavjud emas.` },
          { status: 400 }
        );
      }

      const qty = Math.max(1, Number(reqItem.quantity) || 1);
      if (sizeEntry.stock < qty) {
        return NextResponse.json(
          {
            error: `Omborda yetarli emas: ${product.nameUz} (${reqItem.size}) — faqat ${sizeEntry.stock} dona qolgan.`,
          },
          { status: 400 }
        );
      }

      const colorEntry =
        product.colors.find((c) => c.id === reqItem.colorId) || product.colors[0];

      subtotalUzs += product.priceUzs * qty;

      validatedItems.push({
        productId: product.id,
        sku: product.sku,
        slug: product.slug,
        nameUz: product.nameUz,
        nameRu: product.nameRu,
        nameEn: product.nameEn,
        colorId: colorEntry.id,
        colorName: colorEntry.nameUz,
        colorHex: colorEntry.hex,
        size: reqItem.size,
        quantity: qty,
        unitPriceUzs: product.priceUzs,
        image: product.gallery[0] || "",
      });
    }

    // 2. Validate discount code on server
    let discountAmountUzs = 0;
    let appliedCode: string | undefined = undefined;
    if (discountCode && discountCode.trim()) {
      const cleanCode = discountCode.trim().toUpperCase();
      const promo = db.discounts.find(
        (d) => d.code.toUpperCase() === cleanCode && d.active
      );
      if (!promo) {
        return NextResponse.json(
          { error: `Promo-kod (${cleanCode}) topilmadi yoki muddati tugagan.` },
          { status: 400 }
        );
      }
      if (subtotalUzs < promo.minOrderUzs) {
        return NextResponse.json(
          {
            error: `${cleanCode} promo-kodi kamida ${promo.minOrderUzs.toLocaleString(
              "ru-RU"
            )} UZS xarid uchun amal qiladi.`,
          },
          { status: 400 }
        );
      }
      if (promo.type === "PERCENTAGE") {
        discountAmountUzs = Math.round((subtotalUzs * promo.value) / 100);
      } else {
        discountAmountUzs = promo.value;
      }
      promo.usageCount += 1;
      appliedCode = promo.code;
    }

    // 3. Calculate shipping cost
    const shipOption =
      SHIPPING_OPTIONS.find((s) => s.id === deliveryMethod) || SHIPPING_OPTIONS[0];
    const shippingCostUzs =
      shipOption.freeThresholdUzs > 0 && subtotalUzs >= shipOption.freeThresholdUzs
        ? 0
        : shipOption.priceUzs;

    const totalUzs = Math.max(0, subtotalUzs - discountAmountUzs + shippingCostUzs);

    // 4. Deduct inventory
    for (const item of validatedItems) {
      const product = db.products.find((p) => p.id === item.productId);
      const sizeEntry = product?.sizes.find((s) => s.size === item.size);
      if (sizeEntry) {
        sizeEntry.stock = Math.max(0, sizeEntry.stock - item.quantity);
      }
    }

    // 5. Honest Payment Status State Machine (never fake silent payment success)
    const paymentStatus: PaymentStatus =
      paymentMethod === "CASH_ON_DELIVERY" ? "COD_PENDING" : "PENDING_MERCHANT";

    const initialOrderStatus: OrderStatus =
      paymentMethod === "CASH_ON_DELIVERY" ? "CONFIRMED" : "AWAITING_PAYMENT";

    const orderNumber = `NNN-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: customerName.trim(),
      customerPhone: phoneValidation.normalized,
      customerEmail: customerEmail?.trim() || undefined,
      region,
      district,
      addressLine: addressLine.trim(),
      deliveryMethod: shipOption.id,
      shippingCostUzs,
      subtotalUzs,
      discountCode: appliedCode,
      discountAmountUzs,
      totalUzs,
      paymentMethod,
      paymentStatus,
      status: initialOrderStatus,
      telegramNotified: false,
      notes: notes?.trim() || undefined,
      items: validatedItems,
      createdAt: new Date().toISOString(),
    };

    const gatewayInfo = buildUzPaymentGatewayUrl(newOrder);
    newOrder.paymentGatewayUrl = gatewayInfo.gatewayUrl;

    // 6. Send Telegram order notification
    const tgResult = await sendTelegramOrderAlert(newOrder);
    newOrder.telegramNotified = tgResult.delivered;
    newOrder.telegramLog = tgResult.log;

    // 7. Update or register customer record
    const existingCustomer = db.users.find(
      (u) =>
        u.phone.replace(/\D/g, "") ===
        phoneValidation.normalized.replace(/\D/g, "")
    );
    if (existingCustomer) {
      existingCustomer.totalSpentUzs += totalUzs;
      existingCustomer.ordersCount += 1;
      existingCustomer.region = region;
      existingCustomer.address = `${district}, ${addressLine}`;
    } else {
      db.users.push({
        id: `user-${Date.now()}`,
        email:
          customerEmail?.trim() ||
          `${phoneValidation.normalized.replace(/\D/g, "")}@client.nnnbrand.uz`,
        name: customerName.trim(),
        phone: phoneValidation.normalized,
        role: "CUSTOMER",
        region,
        address: `${district}, ${addressLine}`,
        totalSpentUzs: totalUzs,
        ordersCount: 1,
        createdAt: new Date().toISOString(),
      });
    }

    db.orders.unshift(newOrder);
    writeDb(db);

    return NextResponse.json({
      ok: true,
      order: newOrder,
      gatewayInfo,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Buyurtma yaratishda server xatoligi" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, orderNumber, action, status, paymentStatus } = body;

    const db = readDb();
    const order = db.orders.find(
      (o) => o.id === orderId || o.orderNumber === orderNumber
    );
    if (!order) {
      return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
    }

    if (action === "VERIFY_SANDBOX_PAYMENT") {
      order.paymentStatus = "SANDBOX_VERIFIED";
      order.paymentTransactionId = `${order.paymentMethod}-SANDBOX-${Date.now()
        .toString()
        .slice(-6)}`;
      order.status = "CONFIRMED";
      writeDb(db);
      return NextResponse.json({ ok: true, order, orders: db.orders });
    }

    if (status) {
      order.status = status;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    writeDb(db);
    return NextResponse.json({ ok: true, order, orders: db.orders });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Yangilashda xatolik" },
      { status: 500 }
    );
  }
}
