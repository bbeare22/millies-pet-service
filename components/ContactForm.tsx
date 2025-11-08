"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("https://formspree.io/f/mqagrlpa", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {/* Honeypot (spam trap) */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div>
        <label className="label" htmlFor="name">Your Name</label>
        <input
          id="name"
          name="name"
          className="input min-h-12"
          placeholder="Jane Doe"
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          className="input min-h-12"
          placeholder="you@email.com"
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          className="input min-h-12"
          placeholder="(719) 555-1234"
          title="Please enter a valid phone number"
          required
        />

      </div>

      <div>
        <label className="label" htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          className="input"
          rows={4}
          placeholder="Tell us about your pet(s), preferred dates, etc."
          required
        />
      </div>

      <input type="hidden" name="_subject" value="New inquiry from mpetserv.com" />

      <button
        className="btn w-full sm:w-auto"
        type="submit"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending…" : "Send"}
      </button>

      {/* Confirmation or error message */}
      {status === "sent" && (
        <p className="text-sm text-green-600 mt-2">
          ✅ Thanks! Your message has been sent — we’ll get back to you soon.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600 mt-2">
          ⚠️ Oops! Something went wrong — please try again or email{" "}
          <a href="mailto:mpetserv@gmail.com" className="underline">
            mpetserv@gmail.com
          </a>.
        </p>
      )}
      {status === "idle" && (
        <p className="text-xs text-gray-500 text-center md:text-left">
          We usually reply within a business day.
        </p>
      )}
    </form>
  );
}
