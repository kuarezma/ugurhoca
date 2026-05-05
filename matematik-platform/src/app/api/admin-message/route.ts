import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import { createLogger } from "@/lib/logger";
import { adminMessageSchema } from "@/lib/route-schemas";
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from "@/lib/supabase/server";
import {
  ADMIN_MESSAGE_BROADCAST_EVENT,
  getStudentMessagesChannelName,
} from "@/lib/realtime/studentMessagesChannel";

const log = createLogger("admin-message");

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : "";

    if (!accessToken) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 },
      );
    }

    const authSupabase = createServerSupabaseClient(accessToken);
    const {
      data: { user },
      error: userError,
    } = await authSupabase.auth.getUser(accessToken);

    if (userError || !user?.email) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 },
      );
    }

    if (!isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
    }

    let adminClient: ReturnType<typeof createServiceRoleClient>;
    try {
      adminClient = createServiceRoleClient();
    } catch (serviceError) {
      log.error("Service role client oluşturulamadı", serviceError);
      return NextResponse.json(
        {
          error:
            "Sunucu yapılandırması eksik (SUPABASE_SERVICE_ROLE_KEY).",
        },
        { status: 500 },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = adminMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message || "Geçersiz mesaj isteği.",
        },
        { status: 400 },
      );
    }
    const { student_id, student_name, title, message, sender_id, sender_name, image_url } =
      parsed.data;

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

    const { data: inserted, error } = await adminClient
      .from("notifications")
      .insert(notification)
      .select("*")
      .single();

    if (error) {
      log.error("Admin message insert error", error);
      return NextResponse.json({ error: "Mesaj gönderilemedi." }, { status: 500 });
    }

    try {
      const broadcastChannel = adminClient.channel(
        getStudentMessagesChannelName(student_id),
      );
      const sendResult = await broadcastChannel.send({
        type: "broadcast",
        event: ADMIN_MESSAGE_BROADCAST_EVENT,
        payload: inserted,
      });
      if (sendResult !== "ok") {
        log.warn("Admin mesajı realtime broadcast tamamlanamadı", {
          sendResult,
        });
      }
    } catch (broadcastError) {
      log.warn("Admin mesajı realtime broadcast hatası", {
        error: String(broadcastError),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    log.error("Admin message route error", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
