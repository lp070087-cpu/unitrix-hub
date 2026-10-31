"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";

/** Copia um link absoluto (path relativo à origem atual). */
export function CopyLinkButton({ path, label = "Copiar link", variant = "outline", size = "sm" }: { path: string; label?: string; variant?: ButtonProps["variant"]; size?: ButtonProps["size"] }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copiado");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Não foi possível copiar. Link: " + url);
    }
  }
  return (
    <Button type="button" variant={variant} size={size} onClick={copy}>
      {copied ? <Check strokeWidth={1.6} /> : <Link2 strokeWidth={1.6} />}
      {label}
    </Button>
  );
}
