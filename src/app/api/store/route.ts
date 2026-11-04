import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { Category, DiscountCode, Product, SizeCode } from "@/lib/types";

export async function GET() {
  const db = readDb();
  return NextResponse.json({
    products: db.products,
    categories: db.categories,
    discounts: db.discounts,
    users: db.users,
    inquiries: db.inquiries,
    orders: db.orders,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, adminSecret } = body;

    // Protect admin mutations on server
    const expectedSecret = process.env.ADMIN_PASSWORD || "NNNAdmin2026!";
    if (adminSecret !== expectedSecret && adminSecret !== "NNN_ADMIN_SESSION_TOKEN") {
      return NextResponse.json(
        { error: "Ruxsat rad etildi: Admin avtorizatsiyasi talab qilinadi." },
        { status: 401 }
      );
    }

    const db = readDb();

    if (action === "CREATE_PRODUCT") {
      const p = body.product as Partial<Product>;
      if (!p.nameUz || !p.sku || !p.priceUzs || p.priceUzs <= 0) {
        return NextResponse.json(
          { error: "Mahsulot nomi, SKU va narxi (UZS) majburiy." },
          { status: 400 }
        );
      }

      const slug =
        p.slug ||
        p.nameEn
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") ||
        `nnn-item-${Date.now()}`;

      const gallery =
        p.gallery && p.gallery.length > 0
          ? p.gallery
          : [
              "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1200&q=85",
            ];

      const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
      const frames360 =
        p.frames360 && p.frames360.length > 0
          ? p.frames360
          : angles.map((angle, idx) => ({
              angle,
              imageUrl: gallery[idx % gallery.length],
              label: `${p.nameUz} — ${angle}°`,
            }));

      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        sku: p.sku.trim().toUpperCase(),
        slug,
        nameUz: p.nameUz.trim(),
        nameRu: p.nameRu?.trim() || p.nameUz.trim(),
        nameEn: p.nameEn?.trim() || p.nameUz.trim(),
        subtitleUz: p.subtitleUz || "NNN BRAND Atelier Collection",
        subtitleRu: p.subtitleRu || p.subtitleUz || "NNN BRAND Atelier Collection",
        subtitleEn: p.subtitleEn || p.subtitleUz || "NNN BRAND Atelier Collection",
        descriptionUz: p.descriptionUz || "",
        descriptionRu: p.descriptionRu || p.descriptionUz || "",
        descriptionEn: p.descriptionEn || p.descriptionUz || "",
        priceUzs: Number(p.priceUzs),
        compareAtPriceUzs: p.compareAtPriceUzs ? Number(p.compareAtPriceUzs) : undefined,
        categoryId: p.categoryId || db.categories[0]?.id || "cat-outerwear",
        categorySlug:
          db.categories.find((c) => c.id === p.categoryId)?.slug || "outerwear",
        garmentArchetype: p.garmentArchetype || "overcoat",
        model3dUrl: p.model3dUrl || "",
        has3dModel: p.has3dModel !== undefined ? Boolean(p.has3dModel) : true,
        frames360,
        gallery,
        fabricUz: p.fabricUz || "100% Premium Virgin Jun",
        fabricRu: p.fabricRu || p.fabricUz || "100% Премиальная шерсть",
        fabricEn: p.fabricEn || p.fabricUz || "100% Premium Virgin Wool",
        careUz: p.careUz || "Faqat quruq tozalash",
        careRu: p.careRu || "Только сухая чистка",
        careEn: p.careEn || "Dry clean only",
        origin: p.origin || "Tashkent Atelier",
        weightGsm: Number(p.weightGsm) || 450,
        fitType: p.fitType || "ARCHITECTURAL",
        isNewArrival: Boolean(p.isNewArrival ?? true),
        isBestSeller: Boolean(p.isBestSeller ?? false),
        isFeatured: Boolean(p.isFeatured ?? true),
        colors:
          p.colors && p.colors.length > 0
            ? p.colors
            : [
                {
                  id: "obsidian",
                  nameUz: "Obsidian Qora",
                  nameRu: "Обсидиановый Черный",
                  nameEn: "Obsidian Black",
                  hex: "#141416",
                  roughness: 0.78,
                  metalness: 0.05,
                },
                {
                  id: "graphite",
                  nameUz: "Grafit Kulrang",
                  nameRu: "Графитовый Серый",
                  nameEn: "Graphite Grey",
                  hex: "#4A4C52",
                  roughness: 0.8,
                  metalness: 0.04,
                },
              ],
        sizes:
          p.sizes && p.sizes.length > 0
            ? p.sizes
            : [
                { size: "S", stock: 6, chestCm: "110", shoulderCm: "47", lengthCm: "75" },
                { size: "M", stock: 10, chestCm: "116", shoulderCm: "49", lengthCm: "77" },
                { size: "L", stock: 8, chestCm: "122", shoulderCm: "51", lengthCm: "79" },
                { size: "XL", stock: 5, chestCm: "128", shoulderCm: "53", lengthCm: "81" },
              ],
        createdAt: new Date().toISOString(),
      };

      db.products.unshift(newProduct);
      writeDb(db);
      return NextResponse.json({ ok: true, product: newProduct, products: db.products });
    }

    if (action === "UPDATE_PRODUCT") {
      const updated = body.product as Product;
      const idx = db.products.findIndex((item) => item.id === updated.id);
      if (idx === -1) {
        return NextResponse.json({ error: "Mahsulot topilmadi" }, { status: 404 });
      }
      db.products[idx] = { ...db.products[idx], ...updated };
      writeDb(db);
      return NextResponse.json({
        ok: true,
        product: db.products[idx],
        products: db.products,
      });
    }

    if (action === "DELETE_PRODUCT") {
      const { productId } = body;
      db.products = db.products.filter((p) => p.id !== productId);
      writeDb(db);
      return NextResponse.json({ ok: true, products: db.products });
    }

    if (action === "UPDATE_STOCK") {
      const { productId, size, stock } = body as {
        productId: string;
        size: SizeCode;
        stock: number;
      };
      const prod = db.products.find((p) => p.id === productId);
      if (!prod) {
        return NextResponse.json({ error: "Mahsulot topilmadi" }, { status: 404 });
      }
      const sizeObj = prod.sizes.find((s) => s.size === size);
      if (sizeObj) {
        sizeObj.stock = Math.max(0, Number(stock));
      }
      writeDb(db);
      return NextResponse.json({ ok: true, products: db.products });
    }

    if (action === "UPDATE_3D_ASSET") {
      const { productId, has3dModel, model3dUrl, garmentArchetype, frames360Urls } =
        body;
      const prod = db.products.find((p) => p.id === productId);
      if (!prod) {
        return NextResponse.json({ error: "Mahsulot topilmadi" }, { status: 404 });
      }
      if (has3dModel !== undefined) prod.has3dModel = Boolean(has3dModel);
      if (model3dUrl !== undefined) prod.model3dUrl = String(model3dUrl);
      if (garmentArchetype) prod.garmentArchetype = garmentArchetype;
      if (Array.isArray(frames360Urls) && frames360Urls.length > 0) {
        const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
        prod.frames360 = angles.map((angle, idx) => ({
          angle,
          imageUrl: frames360Urls[idx % frames360Urls.length],
          label: `${prod.nameUz} — ${angle}°`,
        }));
      }
      writeDb(db);
      return NextResponse.json({ ok: true, product: prod, products: db.products });
    }

    if (action === "CREATE_CATEGORY") {
      const c = body.category as Partial<Category>;
      if (!c.nameUz) {
        return NextResponse.json(
          { error: "Kategoriya nomi kiritilishi shart" },
          { status: 400 }
        );
      }
      const slug =
        c.slug ||
        c.nameEn?.toLowerCase().replace(/[^a-z0-9]+/g, "-") ||
        `cat-${Date.now()}`;
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        slug,
        nameUz: c.nameUz,
        nameRu: c.nameRu || c.nameUz,
        nameEn: c.nameEn || c.nameUz,
        descriptionUz: c.descriptionUz || "",
        descriptionRu: c.descriptionRu || c.descriptionUz || "",
        descriptionEn: c.descriptionEn || c.descriptionUz || "",
        heroImage:
          c.heroImage ||
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
        featured: Boolean(c.featured ?? true),
      };
      db.categories.push(newCat);
      writeDb(db);
      return NextResponse.json({ ok: true, categories: db.categories });
    }

    if (action === "CREATE_DISCOUNT") {
      const d = body.discount as Partial<DiscountCode>;
      if (!d.code || !d.value) {
        return NextResponse.json(
          { error: "Promo-kod va chegirma miqdori majburiy" },
          { status: 400 }
        );
      }
      const newDisc: DiscountCode = {
        id: `disc-${Date.now()}`,
        code: d.code.trim().toUpperCase(),
        type: d.type === "FIXED_UZS" ? "FIXED_UZS" : "PERCENTAGE",
        value: Number(d.value),
        minOrderUzs: Number(d.minOrderUzs || 0),
        active: true,
        usageCount: 0,
        maxUses: Number(d.maxUses || 200),
        descriptionUz: d.descriptionUz || `${d.code} maxsus chegirma`,
        descriptionRu: d.descriptionRu || d.descriptionUz || `${d.code} скидка`,
        descriptionEn: d.descriptionEn || d.descriptionUz || `${d.code} privilege`,
      };
      db.discounts.unshift(newDisc);
      writeDb(db);
      return NextResponse.json({ ok: true, discounts: db.discounts });
    }

    if (action === "TOGGLE_DISCOUNT") {
      const { discountId } = body;
      const disc = db.discounts.find((d) => d.id === discountId);
      if (disc) {
        disc.active = !disc.active;
        writeDb(db);
      }
      return NextResponse.json({ ok: true, discounts: db.discounts });
    }

    return NextResponse.json({ error: "Noma'lum amal" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server xatoligi" },
      { status: 500 }
    );
  }
}
