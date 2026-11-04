import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { validateUzPhone } from "@/lib/i18n";
import { ContactInquiry } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, subject, message, appointmentDate } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Ismingizni kiriting." },
        { status: 400 }
      );
    }

    const phoneValidation = validateUzPhone(phone || "");
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { error: phoneValidation.errorUz || "Telefon raqami noto'g'ri." },
        { status: 400 }
      );
    }

    if (!message || message.trim().length < 5) {
      return NextResponse.json(
        { error: "Xabar matnini kiriting." },
        { status: 400 }
      );
    }

    const db = readDb();
    const inquiry: ContactInquiry = {
      id: `inq-${Date.now()}`,
      name: name.trim(),
      phone: phoneValidation.normalized,
      email: email?.trim() || undefined,
      subject: subject?.trim() || "NNN Flagship Showroom Murojaati",
      message: message.trim(),
      appointmentDate: appointmentDate || undefined,
      createdAt: new Date().toISOString(),
    };

    db.inquiries.unshift(inquiry);
    writeDb(db);

    return NextResponse.json({ ok: true, inquiry });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server xatoligi" },
      { status: 500 }
    );
  }
}
