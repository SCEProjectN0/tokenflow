import { NextResponse } from "next/server";
import { saveContactMessage } from "@/lib/db";
import { sendContactEmail } from "@/lib/mail";

export const runtime = "nodejs";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    email?: unknown;
    message?: unknown;
  } | null;

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (name.length < 2 || !isValidEmail(email) || message.length < 10) {
    return NextResponse.json(
      { error: "Please provide a name, valid email, and message with at least 10 characters." },
      { status: 400 },
    );
  }

  const saved = await saveContactMessage({ name, email, message });

  try {
    await sendContactEmail(saved);
  } catch (error) {
    console.error("Contact email failed", error);

    return NextResponse.json(
      {
        error:
          "Message was saved, but email was not sent. Replace SMTP_PASS in .env.local with a real Google App Password and restart the server.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, message: saved }, { status: 201 });
}
