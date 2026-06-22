import { type NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:admin@brisa.app";

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

/**
 * POST /api/push/send
 * Lo llama el Database Webhook de Supabase cuando se inserta una notificación.
 * Envía un Web Push a todas las suscripciones del usuario destinatario y limpia
 * las que ya expiraron (404/410). Protegido por el header x-push-secret.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-push-secret");
  if (
    !process.env.PUSH_SEND_SECRET ||
    secret !== process.env.PUSH_SEND_SECRET
  ) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 401 },
    );
  }
  if (!publicKey || !privateKey) {
    return NextResponse.json(
      { success: false, error: "VAPID no configurado" },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => null);
  // El webhook envía { type, table, record, old_record }.
  const record = body?.record ?? body;
  const userId: string | undefined = record?.user_id;
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Falta user_id" },
      { status: 400 },
    );
  }

  const { data: subs, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("id, subscription")
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  const payload = JSON.stringify({
    title: record.title || "Brisa",
    body: record.message || "",
    url: record.link || "/notifications",
    tag: record.id,
  });

  let sent = 0;
  await Promise.all(
    (subs ?? []).map(async (s) => {
      try {
        await webpush.sendNotification(
          s.subscription as unknown as webpush.PushSubscription,
          payload,
        );
        sent += 1;
      } catch (err) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabaseAdmin
            .from("push_subscriptions")
            .delete()
            .eq("id", s.id);
        }
      }
    }),
  );

  return NextResponse.json({ success: true, sent });
}
