import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const {
      data: { session },
      error: sessionError,
    } = await anonClient.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 },
      );
    }

    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const body = await request.json().catch(() => null);
    const {
      student_id,
      student_name,
      title,
      message,
      sender_id,
      sender_name,
      image_url,
    } = body || {};

    if (!student_id || (!message?.trim() && !title?.trim() && !image_url)) {
      return NextResponse.json({ error: "Eksik alanlar." }, { status: 400 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const notification = {
      user_id: student_id,
      title: title?.trim() || "Uğur Hoca'dan Mesaj",
      message: message?.trim(),
      type: "admin-message",
      is_read: false,
      metadata: {
        sender_id: sender_id || "admin",
        sender_name: sender_name || "Uğur Hoca",
        student_name,
        ip,
        user_agent: userAgent,
        sent_at: new Date().toISOString(),
        image_url: image_url || null,
      },
    };

    const { error } = await adminClient
      .from("notifications")
      .insert(notification);

    if (error) {
      console.error("Admin message error:", error);
      return NextResponse.json(
        { error: "Mesaj gönderilemedi." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin message route error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
