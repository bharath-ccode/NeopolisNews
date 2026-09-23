"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import NewsTicker from "./NewsTicker";
import MobileTabBar from "./MobileTabBar";
import { MobileMenuProvider } from "@/context/MobileMenuContext";

export default function ConditionalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <MobileMenuProvider>
      <NewsTicker />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Clears the fixed bottom tab bar so it never overlaps footer content. */}
      <div className="md:hidden" style={{ height: "calc(56px + env(safe-area-inset-bottom, 0px))" }} aria-hidden="true" />
      <MobileTabBar />
    </MobileMenuProvider>
  );
}
