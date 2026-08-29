/** Today's date (YYYY-MM-DD) in IST, not the server's UTC date — this app
 *  runs on Hyderabad's calendar. Using plain `new Date().toISOString()`
 *  misses anything published "for today" during the ~5.5 hour window
 *  between midnight and 5:30 AM IST, when UTC is still on the previous
 *  calendar day. */
export function getTodayIST(): string {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}
