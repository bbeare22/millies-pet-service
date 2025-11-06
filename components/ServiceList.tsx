import Link from "next/link";
import ServiceCard from "./ServiceCard";
import { SERVICES } from "@/data/services";


const BUSINESS_PHONE_TEL = "+1-719-761-4151";   
const BUSINESS_EMAIL = "mpetserv@gmail.com";   

export default function ServiceList() {
  const walks   = SERVICES.filter((s) => s.name.startsWith("Dog Walk"));
  const dropins = SERVICES.filter((s) => s.name.startsWith("Drop-in"));
  const sitting = SERVICES.filter((s) =>
    s.name.toLowerCase().includes("sitting")
  );
  const addons  = SERVICES.filter(
    (s) => s.name === "Transport" || s.name.toLowerCase().includes("meds")
  );

  return (
    <div className="space-y-8">

      {/* Dog Walks */}
      {walks.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg md:text-xl font-bold text-center md:text-left">
            Dog Walks
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {walks.map((s) => (
              <article key={s.name} className="card">
                <ServiceCard
                  name={s.name}
                  description={s.description}
                  price={s.price}
                  duration={s.duration}
                />
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Drop-ins */}
      {dropins.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg md:text-xl font-bold text-center md:text-left">
            Drop-ins
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dropins.map((s) => (
              <article key={s.name} className="card">
                <ServiceCard
                  name={s.name}
                  description={s.description}
                  price={s.price}
                  duration={s.duration}
                />
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Sitting (overnight) */}
      {sitting.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg md:text-xl font-bold text-center md:text-left">
            Sitting (overnight)
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sitting.map((s) => (
              <article key={s.name} className="card">
                <ServiceCard
                  name={s.name}
                  description={s.description}
                  price={s.price}
                  duration={s.duration}
                />
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Add-ons */}
      {addons.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg md:text-xl font-bold text-center md:text-left">
            Add-ons
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {addons.map((s) => (
              <article key={s.name} className="card">
                <ServiceCard
                  name={s.name}
                  description={s.description}
                  price={s.price}
                  duration={s.duration}
                />
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
