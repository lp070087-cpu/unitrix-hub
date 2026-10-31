"use client";

import { useEffect } from "react";

/** Fallback de último nível: substitui o layout raiz, por isso usa estilos inline. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app:global-error]", error.digest || error.message);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#101114",
          color: "#F1F0EC",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "24px",
        }}
      >
        <main style={{ maxWidth: 420 }}>
          <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#70737B" }}>
            Unitrix
          </p>
          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 44, lineHeight: 1.05, margin: "16px 0 0" }}>
            Algo deu errado.
          </h1>
          <p style={{ color: "#A1A3AA", lineHeight: 1.6, marginTop: 16 }}>
            Ocorreu um erro inesperado ao carregar a aplicação. Tente novamente em instantes.
          </p>
          {error.digest && <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "#70737B" }}>Código: {error.digest}</p>}
          <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{ height: 44, padding: "0 20px", borderRadius: 8, border: 0, background: "#F1F0EC", color: "#101114", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
            >
              Tentar novamente
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{ height: 44, padding: "0 20px", borderRadius: 8, border: "1px solid #2C2F36", color: "#F1F0EC", fontSize: 14, display: "inline-flex", alignItems: "center", textDecoration: "none" }}
            >
              Ir para o início
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
