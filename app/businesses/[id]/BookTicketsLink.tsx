"use client";

import { ExternalLink } from "lucide-react";
import { trackTicketClick } from "@/lib/trackTicketClick";
import { formatTime12h } from "@/lib/formatTime";

interface ShowTime {
  id: string;
  time: string;
  bms_url: string | null;
}

export default function BookTicketsLink({
  bmsUrl, businessId, businessName, movieId, movieTitle, showTimes,
}: {
  bmsUrl: string | null;
  businessId: string;
  businessName: string;
  movieId: string;
  movieTitle: string;
  showTimes: ShowTime[];
}) {
  if (showTimes.length > 0) {
    return (
      <div className="flex flex-wrap gap-1 mt-1.5">
        {showTimes.map((st) => {
          const url = st.bms_url || bmsUrl;
          if (!url) {
            return (
              <span key={st.id} className="text-[10px] font-semibold text-gray-400 border border-gray-200 rounded-full px-1.5 py-0.5">
                {formatTime12h(st.time)}
              </span>
            );
          }
          return (
            <a
              key={st.id}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackTicketClick({
                businessId, businessName, movieId, movieTitle, showTime: st.time, bmsUrl: url, source: "now_showing",
              })}
              className="text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-full px-1.5 py-0.5 transition-colors"
            >
              {formatTime12h(st.time)}
            </a>
          );
        })}
      </div>
    );
  }

  if (!bmsUrl) return null;

  return (
    <a
      href={bmsUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackTicketClick({ businessId, businessName, movieId, movieTitle, bmsUrl, source: "now_showing" })}
      className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 mt-1.5"
    >
      <ExternalLink className="w-3 h-3" /> Book Tickets
    </a>
  );
}
