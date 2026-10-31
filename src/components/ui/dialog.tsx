"use client";

import * as React from "react";
import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

export function DialogContent({ title, description, children, className }: {
  title: string; description?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      <D.Content
        className={cn(
          "fixed z-50 inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-xl border border-border bg-surface p-5 shadow-lift sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:p-6",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95",
          className
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <D.Title className="text-base font-semibold text-foreground">{title}</D.Title>
            {description ? <D.Description className="mt-1 text-[13px] text-foreground-muted">{description}</D.Description> : <D.Description className="sr-only">{title}</D.Description>}
          </div>
          <D.Close className="-mr-1 -mt-1 rounded-md p-1.5 text-foreground-dim hover:bg-surface-hover hover:text-foreground" aria-label="Fechar">
            <X className="h-4 w-4" />
          </D.Close>
        </div>
        {children}
      </D.Content>
    </D.Portal>
  );
}
