# 🐾 Millie's Pet Service

Live Demo: 🌐 millies-pet-service.vercel.app

A modern, mobile-friendly booking website for **Millie’s Pet Service** — a local dog walking and pet care business.  
Customers can browse services, check pricing and availability, and request bookings directly from the site with instant email/text notifications for the owner.

![Millie's Pet Service Preview](public/millies-logo.png)

---

## 🌟 Features

- 📱 **Responsive Design** — looks great on phones, tablets, and desktops  
- 🗓️ **Online Booking Form** — customers can request walks or overnight stays  
- 💬 **Email + SMS Notifications** — real-time updates for new bookings  
- 💾 **Prisma + SQLite (Postgres-ready)** — persistent data storage  
- 🎨 **TailwindCSS Styling** — clean, modern, and accessible design  
- 🐶 **Sticky Mobile “Book Now” Bar** — easy one-tap booking on phones  
- 🔒 **Environment-based Config** — safe credentials and database separation  

---

## 🧰 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org) (App Router)  
- **Styling:** [TailwindCSS](https://tailwindcss.com)  
- **ORM:** [Prisma](https://www.prisma.io/)  
- **Database:** SQLite (local) → Postgres or Turso (production)  
- **Email/SMS:** Nodemailer + Twilio (optional)  
- **Deployment:** [Vercel](https://vercel.com)  

---

## 🚀 Local Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/bbeare22/millies-pet-service.git
   cd millies-pet-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your environment**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your local database and any email/SMS credentials.

4. **Generate and seed Prisma**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

5. **Run the dev server**
   ```bash
   npm run dev
   ```
   Visit → [http://localhost:3000](http://localhost:3000)

---

## 🧑‍💻 Project Structure

```
.
├── app/                  # Next.js app router pages
├── components/           # Reusable UI components
│   ├── Nav.tsx
│   ├── Footer.tsx
│   ├── BookingForm.tsx
│   └── StickyBookBar.tsx
├── prisma/               # Database schema and seed
├── public/               # Static assets (logo, favicon, images)
└── styles/               # Global styles (Tailwind)
```

---

## 📦 Deployment

1. Push the repository to **GitHub**
2. Connect it to **Vercel**
3. Add environment variables:
   - `DATABASE_URL`
   - `SMTP_*` or `TWILIO_*` (optional)
4. Deploy — Vercel will auto-build and host the site.

---

## 💡 Roadmap

- [ ] Add owner dashboard for managing bookings  
- [ ] Integrate Google Calendar sync  
- [ ] Add image gallery & testimonials  
- [ ] Deploy production DB (Neon or Turso)  
- [ ] SEO + analytics polish  

---

## 📄 License

MIT © 2025 — Developed by [Brett Beare](https://github.com/bbeare22)  
Designed for **Millie’s Pet Service** 🐾

---

### 🐕 “Because every tail deserves a happy wag.”
