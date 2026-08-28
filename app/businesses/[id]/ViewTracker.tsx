"use client";

import { useEffect } from "react";

export default function ViewTracker({ id }: { id: string }) {
  useEffect(() => {
    fetch(`/api/businesses/${id}/view`, { method: "POST" });
  }, [id]);
  return null;
}
