"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, ExternalLink, Film, Ticket } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";

const CINEMAS = [
  {
    id: "ALUC",
    name: "Allu Cinemas Kokapet",
    slug: "allu-cinemas-kokapet",
    address: "Kokapet, Hyderabad",
    formats: ["Multiplex", "Dolby Atmos"],
    distance: "0.8 km from Neopolis",
  },
  {
    id: "AACN",
    name: "Aparna Cinemas Nallagandla",
    slug: "aparna-cinemas-nallagandla",
    address: "Nallagandla, Hyderabad",
    formats: ["Multiplex", "Dolby Atmos"],
    distance: "3.2 km from Neopolis",
  },
  {
    id: "MRAD",
    name: "Miraj Cinemas — Anand Mall",
    slug: "miraj-cinemas-anand-mall-and-movies-narsingi",
    address: "Anand Mall, Narsingi, Hyderabad",
    formats: ["Multiplex"],
    distance: "4.1 km from Neopolis",
  },
];

const FORMAT_COLOR: Record<string, string> = {
  "Multiplex":    "bg-gray-100 text-gray-600",
  "IMAX":         "bg-blue-50 text-blue-700",
  "4DX":          "bg-purple-50 text-purple-700",
  "Dolby Atmos":  "bg-amber-50 text-amber-700",
  "Single Screen":"bg-green-50 text-green-700",
};

function formatDate(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function buildBmsUrl(cinema: typeof CINEMAS[0], dateStr: string): string {
  return `https://in.bookmyshow.com/cinemas/hyderabad/${cinema.slug}/buytickets/${cinema.id}/${dateStr}`;
}

function getDays(count = 7) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

export default function CinemasPage() {
  const days = getDays(7);
  const [selectedDay, setSelectedDay] = useState(0);
  const selectedDate = days[selectedDay];
  const dateStr = formatDate(selectedDate);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-700 text-white py-14 md:py-20">
        <SectionWrapper tight>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-gray-800 border border-gray-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
              <Film className="w-3.5 h-3.5" /> Entertainment · Cinemas
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-3 mb-4">
              Cinemas near <span className="text-gray-300">Neopolis</span>
            </h1>
            <p className="text-gray-300 text-lg">
              Pick a date, choose your cinema, and book tickets on BookMyShow.
            </p>
          </div>
        </SectionWrapper>
      </section>

      {/* Date strip */}
      <section className="bg-white border-b border-gray-100 sticky top-[calc(4rem+28px)] z-30">
        <SectionWrapper tight>
          <div className="flex gap-2 overflow-x-auto py-3">
            {days.map((d, i) => {
              const isToday = i === 0;
              const active  = i === selectedDay;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(i)}
                  className={`flex flex-col items-center px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap border transition-colors min-w-[64px] ${
                    active
                      ? "bg-gray-900 text-white border-gray-900"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  <span className="text-xs font-semibold uppercase">
                    {isToday ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short" })}
                  </span>
                  <span className="text-base font-bold">{d.getDate()}</span>
                  <span className="text-xs opacity-70">
                    {d.toLocaleDateString("en-IN", { month: "short" })}
                  </span>
                </button>
              );
            })}
          </div>
        </SectionWrapper>
      </section>

      {/* Cinema cards */}
      <section className="bg-gray-50 min-h-96 py-10">
        <SectionWrapper>
          <p className="text-sm text-gray-500 mb-6">
            Showing showtimes for{" "}
            <span className="font-semibold text-gray-800">
              {selectedDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CINEMAS.map((cinema) => (
              <div key={cinema.id} className="card p-6 space-y-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
                    <Film className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug">{cinema.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" /> {cinema.address}
                    </p>
                    <p className="text-xs text-brand-600 font-medium mt-0.5">{cinema.distance}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {cinema.formats.map((f) => (
                    <span key={f} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${FORMAT_COLOR[f] ?? "bg-gray-100 text-gray-600"}`}>
                      {f}
                    </span>
                  ))}
                </div>

                <a
                  href={buildBmsUrl(cinema, dateStr)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3 rounded-xl transition-colors"
                >
                  <Ticket className="w-4 h-4" /> View Showtimes &amp; Book
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </section>
    </>
  );
}
