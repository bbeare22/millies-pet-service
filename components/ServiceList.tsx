'use client';

import ServiceCard from "./ServiceCard";
import { SERVICES } from "@/data/services";

export default function ServiceList() {
  const walks   = SERVICES.filter((s) => s.name.startsWith("Dog Walk"));
  const dropins = SERVICES.filter((s) => s.name.startsWith("Drop-in"));
  const sitting = SERVICES.filter((s) =>
    s.name.toLowerCase().includes("sitting")
  );
  const addons  = SERVICES.filter(
    (s) => s.name === "Transport" || s.name.toLowerCase().includes("meds")
  );

  const sections = [
    { title: "Dog Walks", data: walks },
    { title: "Drop-ins", data: dropins },
    { title: "Sitting (overnight)", data: sitting },
    { title: "Add-ons", data: addons },
  ];

  return (
    <div className="space-y-12 animate-fadeIn">
      {sections.map(
        (section) =>
          section.data.length > 0 && (
            <section key={section.title} className="space-y-4">
              <h3 className="text-xl font-bold text-text/90">
                {section.title}
              </h3>

              {/* Match the Home Page Popular Services styling */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.data.map((s) => (
                  <div
                    key={s.name}
                    className={[
                      "rounded-2xl border border-[#7B6C57]/30 bg-white p-1",
                      "shadow-md hover:shadow-lg hover:-translate-y-[2px]",
                      "transition-all duration-300",
                    ].join(" ")}
                  >
                    <ServiceCard
                      name={s.name}
                      description={s.description}
                      price={s.price}
                      duration={s.duration}
                    />
                  </div>
                ))}
              </div>
            </section>
          )
      )}
    </div>
  );
}
