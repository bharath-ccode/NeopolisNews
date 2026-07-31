import type { Metadata } from "next";
import HealthClient from "./HealthClient";

export const metadata: Metadata = {
  title: "Health Directory – NeopolisNews",
  description:
    "Hospitals, ambulance services, clinics, diagnostics, and pharmacies in Neopolis — emergency numbers always one tap away.",
};

export default function HealthPage() {
  return <HealthClient />;
}
