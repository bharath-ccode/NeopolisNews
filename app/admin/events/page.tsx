"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PlusCircle, CalendarDays, Trash2, Loader2, Clock, Search, Building2 } from "lucide-react";

const EVENT_TYPES: Record<string, string> = {
  music_concert: "Music Concert",
  sports_run:    "Sports & Run",
  food_festival: "Food Festival",
  culture_art:   "Culture & Art",
  exhibition:    "Exhibition",
};

interface AdminEvent {
  id: string;
  business_id: string;
  name: string;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string;
  description: string | null;
  image_url: string | null;
  businesses: { id: string; name: string } | null;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/events");
    const data = await res.json();
    setEvents(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function handleDelete(id: string) {
    setDeleting(id);
    await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setDeleteConfirm(null);
    setDeleting(null);
  }

  const filtered = events.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      (e.businesses?.name ?? "").toLowerCase().includes(q)
    );
  });

  const upcoming = filtered.filter((e) => e.event_date >= new Date().toISOString().split("T")[0]);
  const past     = filtered.filter((e) => e.event_date <  new Date().toISOString().split("T")[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Events</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {events.length} total · {upcoming.length} upcoming · {past.length} past
          </p>
        </div>
        <Link href="/admin/events/create" className="btn-primary text-sm py-2 self-start sm:self-auto">
          <PlusCircle className="w-4 h-4" /> New Event
        </Link>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by event name or business…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <CalendarDays className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No events found</p>
          <p className="text-gray-400 text-sm mt-1">
            {search ? "Try a different search" : "Create the first event using the button above"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Upcoming</h3>
              <EventList events={upcoming} deleteConfirm={deleteConfirm} deleting={deleting} onDeleteRequest={setDeleteConfirm} onDeleteConfirm={handleDelete} onDeleteCancel={() => setDeleteConfirm(null)} />
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Past</h3>
              <EventList events={past} deleteConfirm={deleteConfirm} deleting={deleting} onDeleteRequest={setDeleteConfirm} onDeleteConfirm={handleDelete} onDeleteCancel={() => setDeleteConfirm(null)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EventList({ events, deleteConfirm, deleting, onDeleteRequest, onDeleteConfirm, onDeleteCancel }: {
  events: AdminEvent[];
  deleteConfirm: string | null;
  deleting: string | null;
  onDeleteRequest: (id: string) => void;
  onDeleteConfirm: (id: string) => void;
  onDeleteCancel: () => void;
}) {
  return (
    <div className="card overflow-hidden divide-y divide-gray-50">
      {events.map((ev) => (
        <div key={ev.id} className="flex items-start gap-4 px-5 py-4">
          {ev.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ev.image_url} alt={ev.name} className="w-16 h-14 rounded-xl object-cover shrink-0 border border-gray-100" />
          ) : (
            <div className="w-16 h-14 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
              <CalendarDays className="w-6 h-6 text-brand-300" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-900 truncate">{ev.name}</p>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <span className="text-xs text-brand-600 font-semibold">
                {new Date(ev.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />{ev.start_time.slice(0, 5)} – {ev.end_time.slice(0, 5)}
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-xs bg-brand-50 text-brand-700 font-semibold px-2 py-0.5 rounded-full">
                {EVENT_TYPES[ev.event_type] ?? ev.event_type}
              </span>
            </div>
            {ev.businesses && (
              <Link href={`/admin/businesses/${ev.businesses.id}`} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600 mt-0.5 transition-colors">
                <Building2 className="w-3 h-3" /> {ev.businesses.name}
              </Link>
            )}
            {ev.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ev.description}</p>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-1">
            {deleteConfirm === ev.id ? (
              <>
                <button onClick={() => onDeleteConfirm(ev.id)} disabled={deleting === ev.id}
                  className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors">
                  {deleting === ev.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete"}
                </button>
                <button onClick={onDeleteCancel} className="px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 text-xs hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => onDeleteRequest(ev.id)}
                className="p-1.5 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
