"use client";

import { Toaster } from "sonner";

export function ConditionalUI() {
  return (
    <Toaster
      theme="dark"
      position="top-right"
      toastOptions={{
        style: { background: "rgb(34 37 43)", border: "1px solid rgb(60 64 72)", color: "rgb(241 240 236)", fontFamily: "var(--font-sans)" },
      }}
    />
  );
}
