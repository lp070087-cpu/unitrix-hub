"use client";

import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser } from "lucide-react";

/** Área de assinatura desenhada. Emite PNG em dataURL (ou null quando vazia). */
export function SignaturePad({ onChange, disabled }: { onChange: (dataUrl: string | null) => void; disabled?: boolean }) {
  const ref = useRef<SignatureCanvas | null>(null);

  function emit() {
    const pad = ref.current;
    if (!pad || pad.isEmpty()) return onChange(null);
    onChange(pad.toDataURL("image/png"));
  }

  return (
    <div className="signature-canvas">
      <div className="relative">
        <SignatureCanvas
          ref={ref}
          penColor="#1a1b1f"
          minWidth={0.8}
          maxWidth={2.4}
          onEnd={emit}
          canvasProps={{
            className: "block h-[180px] w-full",
            "aria-label": "Área para desenhar a assinatura",
            style: disabled ? { pointerEvents: "none", opacity: 0.6 } : undefined,
          }}
        />
        <span className="pointer-events-none absolute inset-x-6 bottom-10 border-b border-dashed border-paper-line" aria-hidden />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-paper-muted">
        <span>Desenhe sua assinatura com o mouse ou o dedo.</span>
        <button
          type="button"
          onClick={() => {
            ref.current?.clear();
            onChange(null);
          }}
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 font-medium text-paper-ink hover:bg-black/5"
          disabled={disabled}
        >
          <Eraser className="h-3.5 w-3.5" strokeWidth={1.6} /> Limpar
        </button>
      </div>
    </div>
  );
}
