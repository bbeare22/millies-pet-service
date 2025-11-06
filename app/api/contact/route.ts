import type { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import twilio from "twilio";

export const runtime = "nodejs"; 

function clean(s: unknown) {
  return String(s ?? "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = clean(body.name);
    const email = clean(body.email);
    const message = clean(body.message);
    const honeypot = clean(body.website); 

    
    if (honeypot) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

   
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    });

    const emailSubject = `New Inquiry from ${name}`;
    const emailText = [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      message,
    ].join("\n");

    await transporter.sendMail({
      to: process.env.NOTIFY_EMAIL_TO!,
      from: process.env.NOTIFY_EMAIL_FROM || process.env.SMTP_USER!,
      replyTo: email,
      subject: emailSubject,
      text: emailText,
    });

    
    try {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID!,
        process.env.TWILIO_AUTH_TOKEN!
      );
      const smsBody = `New inquiry: ${name} <${email}>\n${message.slice(0, 300)}`;
      await client.messages.create({
        to: process.env.NOTIFY_SMS_TO!,
        from: process.env.TWILIO_FROM_NUMBER!,
        body: smsBody,
      });
    } catch {}

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
