# Paws & Paths — Dog Walking Website (Next.js + Prisma)

A professional, bookable website for a dog-walking business. Includes:
- Services & Pricing
- Availability preview
- Booking form with email + SMS owner notification (SMTP + Twilio)
- Prisma + SQLite for data storage

## Quick Start

```bash
# 1) Clone and install
pnpm i   # or npm i / yarn

# 2) Configure env
cp .env.example .env
# Edit .env with your SMTP + Twilio details (or skip SMS/email during local dev).

# 3) Setup DB
npx prisma generate
npx prisma db push
npm run seed

# 4) Run dev
npm run dev
```

Open http://localhost:3000

## Deploy
- **Render** or **Vercel** works well. For Vercel, switch to Postgres (Neon/Planetscale) or use Turso/LibSQL.
- Set env vars in the hosting dashboard: `DATABASE_URL`, SMTP + Twilio vars.

## Customizing
- Update branding in `.env` keys `NEXT_PUBLIC_SITE_*`
- Edit services in `prisma/seed.js` or via DB.
- Update social links in `components/Footer.tsx`
- Replace public/logo.svg

## Notifications
- Email uses Nodemailer with your SMTP. (Providers: Mailgun, Brevo, Resend (SMTP), SendGrid)
- SMS uses Twilio. If you don't want SMS, omit those env vars and the route will skip it.

## Roadmap
- Admin login to confirm/cancel bookings
- Real calendar with blocked-out slots
- Stripe payments and deposits
- Reviews/testimonials