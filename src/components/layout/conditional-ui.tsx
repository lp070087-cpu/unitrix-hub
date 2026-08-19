"use client";

import { usePathname } from "next/navigation";
import { SplashScreen } from "@/components/splash/splash-screen";
import { Toaster } from "sonner";

export function ConditionalUI() {
  const pathname = usePathname();

  // Landing page: no splash, no toaster
  if (pathname?.startsWith("/landing")) return null;

  return (
    <>
      <SplashScreen />
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: { background: "#0E0E11", border: "1px solid rgba(255,255,255,0.06)", color: "#E8E8E8" },
        }}
      />
    </>
  );
}
