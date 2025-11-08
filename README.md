# 🐾 Millie's Pet Service LLC

🌐 **Live Demo:** [mpetserv.com](https://mpetserv.com)

A modern, mobile-friendly website for **Millie’s Pet Service LLC** — a local dog walking and pet care business in Colorado Springs.  
Visitors can explore services, view policies, and contact Millie directly via a simple message form that sends inquiries straight to her email.

![Millie's Pet Service Preview](public/millies-logo.png)

---

## 🌟 Features

- 📱 **Fully Responsive Design** — optimized for phones, tablets, and desktops
- 🐶 **Services & Pricing Section** — clear breakdown of walks, drop-ins, and sitting
- 📋 **Policies Page** — detailed info on vaccinations, cancellations, payments & more
- 💌 **Contact Form (Formspree)** — messages go directly to Millie’s inbox
- ❤️ **Animated Branding** — pulsing heart accent and round logo integration
- 🎨 **TailwindCSS Styling** — clean, modern, and mobile-first design
- ⚡ **Static, Fast, and Secure** — lightweight Next.js site with zero backend required

---

## 🧰 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org) (App Router)
- **Styling:** [TailwindCSS](https://tailwindcss.com)
- **Form Handling:** [Formspree](https://formspree.io)
- **Deployment:** [Vercel](https://vercel.com)
- **Email:** Formspree-based submission to business inbox

---

## 🚀 Local Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/bbeare22/millies-pet-service.git
   cd millies-pet-service
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   Visit → [http://localhost:3000](http://localhost:3000)

---

## 🧑‍💻 Project Structure

```
.
├── app/                    # Next.js app router pages
│   ├── contact/            # Contact form + info card
│   ├── policies/           # Policies and guidelines
│   ├── services/           # Services & pricing
│   └── page.tsx            # Home (hero + featured services)
├── components/             # Reusable UI components
│   ├── Nav.tsx             # Top navigation bar
│   ├── Footer.tsx
│   ├── ContactForm.tsx
│   └── ServiceList.tsx
├── public/                 # Static assets (logo, images)
└── styles/                 # Global Tailwind styles
```

---

## 🧾 Recent Updates (2025-11)

- ✂️ Removed booking, admin, and database features
- 🐾 Added **Policies** page for transparency and trust
- 💬 Integrated **Formspree contact form** with live email delivery
- 🖼️ Redesigned **logo** (round format with full business name)
- 💓 Added animated pulsing heart and responsive logo sizing
- 🎨 Improved responsive layouts and text alignment
- 🧹 Cleaned up environment and dependency files for simplicity

---

## 💡 Future Enhancements

- [ ] Add gallery or testimonial section
- [ ] Add FAQ for new clients
- [ ] Add appointment confirmation emails
- [ ] SEO optimization & Google Maps integration

---

## 📄 License

MIT © 2025 — Developed by [Brett Beare](https://github.com/bbeare22)  
Designed for **Millie’s Pet Service LLC** 🐾

---


> “Because every tail deserves a happy wag.” 💕
