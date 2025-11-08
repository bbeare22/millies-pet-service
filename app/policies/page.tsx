import Link from "next/link";

export const metadata = {
  title: "Policies • Millie’s Pet Service",
  description:
    "Vaccination, health & safety, scheduling, payments, cancellations, emergencies, and other service policies.",
};

const BUSINESS_PHONE_DISPLAY = "(719) 761-4151";
const BUSINESS_PHONE_TEL = "+1-719-761-4151";
const BUSINESS_EMAIL = "mpetserv@gmail.com";

export default function PoliciesPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 text-center md:text-left">
      <h1 className="text-3xl font-extrabold">Policies</h1>
      <p className="mt-3 text-gray-600">
        These policies help us provide safe, consistent, and stress-free care. If you have questions,
        please{" "}
        <a href={`tel:${BUSINESS_PHONE_TEL}`} className="underline">
          call/text {BUSINESS_PHONE_DISPLAY}
        </a>{" "}
        or{" "}
        <a href={`mailto:${BUSINESS_EMAIL}`} className="underline">
          email us
        </a>
        .
      </p>

      <section className="mt-10 space-y-8 text-center md:text-left">
        {/* Vaccinations */}
        <div className="rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">Vaccinations</h2>
          <ul className="mt-3 space-y-1 text-gray-700 list-none pl-0 md:list-disc md:pl-5">
            <li>
              Pets must be vaccinated for <strong>Rabies</strong>, <strong>Distemper</strong>, and{" "}
              <strong>Bordetella</strong> (kennel cough). Please keep records available upon request.
            </li>
            <li>Puppies/kittens must follow age-appropriate vaccination schedules.</li>
          </ul>
        </div>

        {/* Health & Safety */}
        <div className="rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">Health &amp; Safety</h2>
          <ul className="mt-3 space-y-1 text-gray-700 list-none pl-0 md:list-disc md:pl-5">
            <li>Please disclose any medical conditions, allergies, medications, or behavior notes.</li>
            <li>Pets must be free of contagious illness and external parasites (fleas/ticks).</li>
            <li>We require secure collars/harnesses and up-to-date ID tags or microchips.</li>
          </ul>
        </div>

        {/* Medications */}
        <div className="rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">Medications</h2>
          <ul className="mt-3 space-y-1 text-gray-700 list-none pl-0 md:list-disc md:pl-5">
            <li>
              <strong>Original vet-prescribed bottle only.</strong> All medication must be in the container
              dispensed by your veterinarian with the pet’s name, medication name, strength, and clear
              dosing instructions.
            </li>
            <li>
              We cannot accept medications that are <em>pre-bagged</em>, mixed into food in advance, or placed in
              <em> Ziploc bags</em>. No exceptions.
            </li>
            <li>
              Provide the exact <strong>dose and schedule</strong> (AM/PM or specific time window). We cannot alter
              a dosage or frequency without written veterinary direction.
            </li>
            <li>
              Refrigerated meds are okay—please let us know and supply any needed syringes/pill pockets.
            </li>
            <li>
              For everyone’s safety, we cannot administer controlled substances without a written vet order.
            </li>
            <li>
              Medication will be given within a reasonable time window around the requested time (traffic/weather permitting).
            </li>
          </ul>
          <p className="mt-3 text-sm text-gray-600">
            Tip: Send a photo of the prescription label before your visit so we can confirm details.
          </p>
        </div>

        {/* Behavior */}
        <div className="rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">Behavior</h2>
          <ul className="mt-3 space-y-1 text-gray-700 list-none pl-0 md:list-disc md:pl-5">
            <li>Please inform us of reactivity, bite history, resource guarding, or escape risk.</li>
            <li>For everyone’s safety, we may decline or modify services for aggressive behavior.</li>
            <li>Leash walks only unless a fully secured yard is available and permitted by you.</li>
          </ul>
        </div>

        {/* Scheduling & Cancellations */}
        <div className="rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">Scheduling &amp; Cancellations</h2>
          <ul className="mt-3 space-y-1 text-gray-700 list-none pl-0 md:list-disc md:pl-5">
            <li>Text is the fastest way to schedule. We typically reply within a few hours.</li>
            <li>
              <strong>Cancellations:</strong> Please give at least 24 hours’ notice for standard visits
              and 72 hours for overnight sitting when possible.
            </li>
            <li>Delays caused by weather/traffic may adjust arrival windows slightly.</li>
          </ul>
        </div>

        {/* Payments */}
        <div className="rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">Payments</h2>
          <ul className="mt-3 space-y-1 text-gray-700 list-none pl-0 md:list-disc md:pl-5">
            <li>Accepted: Zelle, PayPal, Venmo, Apple Pay.</li>
            <li>Payment is due at or before service start; overnights may require a deposit.</li>
            <li>Additional pets or special care may incur add-on fees as listed on the Services page.</li>
          </ul>
        </div>

        {/* Keys & Home Access */}
        <div className="rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">Keys &amp; Home Access</h2>
          <ul className="mt-3 space-y-1 text-gray-700 list-none pl-0 md:list-disc md:pl-5">
            <li>Please provide reliable access (keys, code, smart lock) and any alarm instructions.</li>
            <li>We lock doors and gates after each visit and respect your home and privacy.</li>
          </ul>
        </div>

        {/* Weather */}
        <div className="rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">Weather</h2>
          <ul className="mt-3 space-y-1 text-gray-700 list-none pl-0 md:list-disc md:pl-5">
            <li>
              In extreme heat, cold, storms, or poor air quality, outdoor time may be shortened for
              safety and replaced with indoor enrichment.
            </li>
            <li>Please leave towels, booties, or coats if your pet needs them.</li>
          </ul>
        </div>

        {/* Photos & Updates */}
        <div className="rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">Photos &amp; Updates</h2>
          <ul className="mt-3 space-y-1 text-gray-700 list-none pl-0 md:list-disc md:pl-5">
            <li>We’re happy to send quick updates and photos during or after visits upon request.</li>
            <li>Photos may be used for private updates only; marketing use requires your permission.</li>
          </ul>
        </div>

        {/* Emergencies */}
        <div className="rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">Emergencies &amp; Vet Care</h2>
          <ul className="mt-3 space-y-1 text-gray-700 list-none pl-0 md:list-disc md:pl-5">
            <li>
              Please provide your preferred veterinarian and an emergency contact. In urgent situations,
              we will seek prompt veterinary care and contact you immediately.
            </li>
            <li>Owner is responsible for veterinary costs unless otherwise agreed.</li>
          </ul>
        </div>

        {/* Service Area & Holidays */}
        <div className="rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">Service Area &amp; Holidays</h2>
          <ul className="mt-3 space-y-1 text-gray-700 list-none pl-0 md:list-disc md:pl-5">
            <li>Service area is limited to local neighborhoods; travel surcharges may apply outside.</li>
            <li>Holiday bookings may have limited availability and/or adjusted rates.</li>
          </ul>
        </div>

        {/* Liability & Privacy */}
        <div className="rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">Liability &amp; Privacy</h2>
          <ul className="mt-3 space-y-1 text-gray-700 list-none pl-0 md:list-disc md:pl-5">
            <li>
              We take reasonable precautions, but pets and environments can be unpredictable. By booking,
              you acknowledge inherent risks associated with animal care and walks.
            </li>
            <li>Your personal information is used only for scheduling and care coordination.</li>
          </ul>
        </div>
      </section>

      <p className="mt-10 text-sm text-gray-500">
        <em>These policies are provided for clarity and may be updated periodically.</em>
      </p>

      <div className="mt-8">
        <Link href="/services" className="underline underline-offset-4">
          View Services &amp; Pricing
        </Link>
      </div>
    </main>
  );
}
