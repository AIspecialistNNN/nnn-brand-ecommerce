import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { validateUzPhone } from "@/lib/i18n";
import { UserAccount } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, email, password, name, phone, region, address } = body;

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@nnnbrand.uz").toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD || "NNNAdmin2026!";

    if (mode === "ADMIN_LOGIN") {
      if (
        email?.trim().toLowerCase() === adminEmail &&
        password === adminPass
      ) {
        const db = readDb();
        const adminUser =
          db.users.find((u) => u.role === "ADMIN") || {
            id: "user-admin",
            email: adminEmail,
            name: "Sardor Alimov (NNN Creative Director)",
            phone: "+998 90 100 00 01",
            role: "ADMIN" as const,
            totalSpentUzs: 0,
            ordersCount: 0,
            createdAt: new Date().toISOString(),
          };
        return NextResponse.json({
          ok: true,
          user: adminUser,
          adminToken: "NNN_ADMIN_SESSION_TOKEN",
        });
      }
      return NextResponse.json(
        { error: "Admin login yoki parol noto'g'ri." },
        { status: 401 }
      );
    }

    if (mode === "CUSTOMER_LOGIN") {
      const db = readDb();
      const found = db.users.find(
        (u) =>
          (email && u.email.toLowerCase() === email.trim().toLowerCase()) ||
          (phone &&
            u.phone.replace(/\D/g, "") === phone.replace(/\D/g, ""))
      );
      if (!found) {
        return NextResponse.json(
          {
            error:
              "Bunday profil topilmadi. Iltimos, ro'yxatdan o'ting yoki javohir@client.uz demo profilini sinab ko'ring.",
          },
          { status: 404 }
        );
      }
      const userOrders = db.orders.filter(
        (o) =>
          o.customerPhone.replace(/\D/g, "") ===
            found.phone.replace(/\D/g, "") ||
          (o.customerEmail &&
            o.customerEmail.toLowerCase() === found.email.toLowerCase())
      );
      return NextResponse.json({ ok: true, user: found, orders: userOrders });
    }

    if (mode === "CUSTOMER_REGISTER") {
      if (!name || name.trim().length < 2) {
        return NextResponse.json(
          { error: "Ism va familiyangizni kiriting." },
          { status: 400 }
        );
      }
      const phoneCheck = validateUzPhone(phone || "");
      if (!phoneCheck.valid) {
        return NextResponse.json(
          { error: phoneCheck.errorUz || "Telefon raqami noto'g'ri." },
          { status: 400 }
        );
      }

      const db = readDb();
      let user = db.users.find(
        (u) =>
          u.phone.replace(/\D/g, "") ===
          phoneCheck.normalized.replace(/\D/g, "")
      );

      if (!user) {
        user = {
          id: `user-${Date.now()}`,
          email:
            email?.trim() ||
            `${phoneCheck.normalized.replace(/\D/g, "")}@client.nnnbrand.uz`,
          name: name.trim(),
          phone: phoneCheck.normalized,
          role: "CUSTOMER",
          region: region || "Toshkent shahri",
          address: address || "",
          totalSpentUzs: 0,
          ordersCount: 0,
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
        writeDb(db);
      } else {
        user.name = name.trim();
        if (email) user.email = email.trim();
        if (region) user.region = region;
        if (address) user.address = address;
        writeDb(db);
      }

      const userOrders = db.orders.filter(
        (o) =>
          o.customerPhone.replace(/\D/g, "") ===
          user!.phone.replace(/\D/g, "")
      );

      return NextResponse.json({ ok: true, user, orders: userOrders });
    }

    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Avtorizatsiya xatoligi" },
      { status: 500 }
    );
  }
}
