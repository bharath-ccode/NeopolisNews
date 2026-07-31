import type { Metadata } from "next";
import EducationClient from "./EducationClient";

export const metadata: Metadata = {
  title: "Education Directory – NeopolisNews",
  description:
    "Schools, day care centres, and coaching academies in the Neopolis district — find the right institution for your child.",
};

export default function EducationPage() {
  return <EducationClient />;
}
