
export const metadata = { title: "Contact — Millie's Pet Service" };

export default function ContactPage() {
  return (
    <div className="py-10 space-y-4">
      <h1 className="text-3xl font-heading text-brand font-bold">Contact</h1>
      <p className="text-gray-700">
        Call or text: <a className="underline" href="tel:+17197614151">(719) 761-4151</a>
      </p>
      <p className="text-gray-700">
        Email: <a className="underline" href="mailto:milliespetserv@gmail.com">milliespetserv@gmail.com</a>
      </p>
      <p className="italic text-brand-dark font-heading mt-4">Love & Cuddles are FREE!</p>
    </div>
  );
}
