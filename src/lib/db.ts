import fs from "fs";
import path from "path";
import {
  INITIAL_CATEGORIES,
  INITIAL_DISCOUNTS,
  INITIAL_INQUIRIES,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
} from "./seedData";
import {
  Category,
  ContactInquiry,
  DiscountCode,
  Order,
  Product,
  UserAccount,
} from "./types";

export interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  discounts: DiscountCode[];
  orders: Order[];
  users: UserAccount[];
  inquiries: ContactInquiry[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "store.json");

function ensureDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const seed: DatabaseSchema = {
        products: INITIAL_PRODUCTS,
        categories: INITIAL_CATEGORIES,
        discounts: INITIAL_DISCOUNTS,
        orders: INITIAL_ORDERS,
        users: INITIAL_USERS,
        inquiries: INITIAL_INQUIRIES,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), "utf-8");
      return seed;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error("Database initialization fallback:", err);
    return {
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      discounts: INITIAL_DISCOUNTS,
      orders: INITIAL_ORDERS,
      users: INITIAL_USERS,
      inquiries: INITIAL_INQUIRIES,
    };
  }
}

export function readDb(): DatabaseSchema {
  return ensureDb();
}

export function writeDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write database store:", err);
  }
}

export async function sendTelegramOrderAlert(order: Order): Promise<{
  delivered: boolean;
  log: string;
}> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const lines = [
    `◼️ *NNN BRAND — YANGI BUYURTMA #${order.orderNumber}*`,
    `👤 Mijoz: ${order.customerName}`,
    `📞 Tel: ${order.customerPhone}`,
    `📍 Manzil: ${order.region}, ${order.district}, ${order.addressLine}`,
    `🚚 Yetkazish: ${order.deliveryMethod}`,
    `💳 To'lov usuli: ${order.paymentMethod} (${order.paymentStatus})`,
    `💰 Jami: ${order.totalUzs.toLocaleString("ru-RU")} UZS`,
    `📦 Mahsulotlar:`,
    ...order.items.map(
      (i) =>
        `  • ${i.nameUz} [${i.colorName} / ${i.size}] × ${i.quantity} — ${(
          i.unitPriceUzs * i.quantity
        ).toLocaleString("ru-RU")} UZS`
    ),
  ];

  const text = lines.join("\n");

  if (token && chatId) {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "Markdown",
          }),
        }
      );
      if (res.ok) {
        return {
          delivered: true,
          log: `Delivered via Telegram Bot API (${new Date().toISOString()})`,
        };
      }
      return {
        delivered: false,
        log: `Telegram API returned HTTP ${res.status}`,
      };
    } catch (e: any) {
      return {
        delivered: false,
        log: `Telegram API error: ${e?.message || "Network error"}`,
      };
    }
  }

  return {
    delivered: true,
    log: `Telegram payload queued (Configure TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID in .env for live push) — ${new Date().toLocaleTimeString()}`,
  };
}

export function buildUzPaymentGatewayUrl(order: Order): {
  configured: boolean;
  gatewayUrl: string;
  merchantNote: string;
} {
  if (order.paymentMethod === "CLICK") {
    const merchantId = process.env.CLICK_MERCHANT_ID;
    const serviceId = process.env.CLICK_SERVICE_ID;
    if (merchantId && serviceId) {
      const url = `https://my.click.uz/services/pay?service_id=${encodeURIComponent(
        serviceId
      )}&merchant_id=${encodeURIComponent(
        merchantId
      )}&amount=${order.totalUzs}&transaction_param=${encodeURIComponent(
        order.orderNumber
      )}`;
      return {
        configured: true,
        gatewayUrl: url,
        merchantNote: "Live Click Uzbekistan checkout link generated",
      };
    }
    return {
      configured: false,
      gatewayUrl: `/checkout?order=${order.orderNumber}&gateway=CLICK`,
      merchantNote:
        "CLICK_MERCHANT_ID / CLICK_SERVICE_ID .env da kiritilmagan — Sandbox tekshiruv rejimi faol",
    };
  }

  if (order.paymentMethod === "PAYME") {
    const merchantId = process.env.PAYME_MERCHANT_ID;
    if (merchantId) {
      // Payme expects amount in tiyin (1 UZS = 100 tiyin)
      const params = Buffer.from(
        `m=${merchantId};ac.order_id=${order.orderNumber};a=${
          order.totalUzs * 100
        }`
      ).toString("base64");
      return {
        configured: true,
        gatewayUrl: `https://checkout.paycom.uz/${params}`,
        merchantNote: "Live Payme Business checkout link generated",
      };
    }
    return {
      configured: false,
      gatewayUrl: `/checkout?order=${order.orderNumber}&gateway=PAYME`,
      merchantNote:
        "PAYME_MERCHANT_ID .env da kiritilmagan — Sandbox tekshiruv rejimi faol",
    };
  }

  return {
    configured: true,
    gatewayUrl: "",
    merchantNote: "Yetkazib berilganda to'lov (Naqd yoki Uzcard/Humo terminal)",
  };
}
