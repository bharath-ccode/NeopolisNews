/** Fire-and-forget log of a "book tickets" click-through to BookMyShow —
 *  the demand-proof metric for the movie-tickets pitch item. Both call
 *  sites open the BookMyShow link in a new tab, so the current page never
 *  unloads and a plain fetch (no sendBeacon/keepalive) is enough. */
export function trackTicketClick(payload: {
  businessId?: string;
  businessName?: string;
  movieId?: string;
  movieTitle?: string;
  showDate?: string;
  bmsUrl: string;
  source: "cinemas_page" | "now_showing";
}) {
  fetch("/api/ticket-clicks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
