import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serviceId, customerName, email, phone, start, notes } = body;

    if (!serviceId || !customerName || !email || !phone || !start) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({ where: { id: Number(serviceId) } });
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

    const booking = await prisma.booking.create({
      data: {
        serviceId: Number(serviceId),
        customerName,
        email,
        phone,
        start: new Date(start),
        notes: notes || null
      },
      include: { service: true }
    });

    // Email notification (owner)
    if (process.env.SMTP_HOST && process.env.NOTIFY_EMAIL_TO && process.env.NOTIFY_EMAIL_FROM) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const html = `
        <h2>New Booking Request</h2>
        <p><strong>Service:</strong> ${booking.service.name}</p>
        <p><strong>Name:</strong> ${booking.customerName}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Start:</strong> ${new Date(booking.start).toLocaleString()}</p>
        <p><strong>Notes:</strong> ${booking.notes || '-'}</p>
      `;

      await transporter.sendMail({
        from: process.env.NOTIFY_EMAIL_FROM,
        to: process.env.NOTIFY_EMAIL_TO,
        subject: `New booking: ${booking.service.name} on ${new Date(booking.start).toLocaleString()}`,
        html
      });
    }

    // SMS notification (owner)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER && process.env.NOTIFY_SMS_TO) {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `New booking: ${booking.service.name} for ${booking.customerName} at ${new Date(booking.start).toLocaleString()}.`,
        from: process.env.TWILIO_FROM_NUMBER,
        to: process.env.NOTIFY_SMS_TO
      });
    }

    // Confirmation email to customer (optional)
    if (process.env.SMTP_HOST && process.env.NOTIFY_EMAIL_FROM) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      await transporter.sendMail({
        from: process.env.NOTIFY_EMAIL_FROM,
        to: email,
        subject: `We received your booking request`,
        html: `<p>Hi ${customerName},</p><p>Thanks for your request for <strong>${service.name}</strong> on ${new Date(booking.start).toLocaleString()}. We'll confirm shortly!</p>`
      });
    }

    return NextResponse.json({ ok: true, bookingId: booking.id });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}