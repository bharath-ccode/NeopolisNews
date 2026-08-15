"use client";

import { ExternalLink } from "lucide-react";
import { trackTicketClick } from "@/lib/trackTicketClick";

export default function BookTicketsLink({
  bmsUrl, businessId, businessName, movieId, movieTitle,
}: {
  bmsUrl: string;
  businessId: string;
  businessName: string;
  movieId: string;
  movieTitle: string;
}) {
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
