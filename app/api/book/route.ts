import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs'; 

const prisma = new PrismaClient();

function hasEmailEnv() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.NOTIFY_EMAIL_TO && process.env.NOTIFY_EMAIL_FROM);
}
function hasSmsEnv() {
  return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER && process.env.NOTIFY_SMS_TO);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serviceId, customerName, email, phone, start, notes } = body ?? {};

    if (!serviceId || !customerName || !email || !phone || !start) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // create booking
    const booking = await prisma.booking.create({
      data: {
        serviceId: Number(serviceId),
        customerName: String(customerName),
        email: String(email),
        phone: String(phone),
        start: new Date(start),
        notes: notes ? String(notes) : '',
      },
      include: { service: true },
    });

    
    let emailSent = false;
    if (hasEmailEnv()) {
      try {
        const nodemailer = (await import('nodemailer')).default;
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const subject = `New Booking: ${booking.service?.name ?? 'Service'} for ${booking.customerName}`;
        const text = [
          `New booking request`,
          `Service: ${booking.service?.name}`,
          `Name: ${booking.customerName}`,
          `Email: ${booking.email}`,
          `Phone: ${booking.phone}`,
          `Start: ${new Date(booking.start).toLocaleString()}`,
          `Notes: ${booking.notes || '-'}`,
        ].join('\n');

        await transporter.sendMail({
          from: process.env.NOTIFY_EMAIL_FROM!,
          to: process.env.NOTIFY_EMAIL_TO!,
          subject,
          text,
        });
        emailSent = true;
      } catch (err) {
        console.error('Email send failed:', err);
      }
    }

    // Try SMS (optional)
    let smsSent = false;
    if (hasSmsEnv()) {
      try {
        const twilio = (await import('twilio')).default(
          process.env.TWILIO_ACCOUNT_SID!,
          process.env.TWILIO_AUTH_TOKEN!
        );
        await twilio.messages.create({
          from: process.env.TWILIO_FROM_NUMBER!,
          to: process.env.NOTIFY_SMS_TO!,
          body: `New booking: ${booking.service?.name} for ${booking.customerName} at ${new Date(booking.start).toLocaleString()}`,
        });
        smsSent = true;
      } catch (err) {
        console.error('SMS send failed:', err);
      }
    }

    return NextResponse.json({
      ok: true,
      bookingId: booking.id,
      notifications: { emailSent, smsSent },
    });
  } catch (e) {
    console.error('Booking API error:', e);
    return NextResponse.json({ error: 'Server error creating booking.' }, { status: 500 });
  }
}
