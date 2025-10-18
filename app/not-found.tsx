import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="py-16">
      <div className="container text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-extrabold">Page not found</h1>
        <p className="text-gray-700">Let’s get you back to something cute.</p>
        <Link href="/" className="btn">Go Home</Link>
      </div>
    </section>
  );
}
