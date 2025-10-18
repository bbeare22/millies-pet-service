export const metadata = { title: 'Request Sent' };

export default function Thanks() {
  return (
    <section className="py-12">
      <div className="container max-w-2xl">
        <div className="card space-y-4 text-center">
          <h1 className="text-3xl font-extrabold">Request sent 🎉</h1>
          <p className="text-gray-700">
            Thanks! We received your booking request and will confirm by email/text.
          </p>
          <p className="text-gray-600 text-sm">
            If you need to make a change, just reply to the confirmation message once it arrives.
          </p>
        </div>
      </div>
    </section>
  );
}
