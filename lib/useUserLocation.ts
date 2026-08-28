"use client";

import { useEffect, useState } from "react";

export interface UserLocation {
  lat: number;
  lng: number;
}

/** Requests the browser's geolocation once on mount. Returns null until
 *  granted, and stays null forever if denied or unsupported — callers
 *  should treat null as "distance unavailable," never block on it. */
export function useUserLocation(): UserLocation | null {
  const [location, setLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {/* denied or unavailable — silently no-op, distance just won't show */},
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60_000 }
    );
  }, []);

  return location;
}
