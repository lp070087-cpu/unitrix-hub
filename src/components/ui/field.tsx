import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-md bg-surface-sunken border border-border text-sm text-foreground placeholder:text-foreground-dim transition-colors focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/15 disabled:opacity-60 aria-[invalid=true]:border-danger/60";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(base, "h-10 px-3", className)} {...props} />
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(base, "min-h-[96px] px-3 py-2.5 leading-relaxed", className)} {...props} />
);
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(base, "h-10 pl-3 pr-9 appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:12px]", className)}
      style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='%23A1A3AA' stroke-width='1.5'><path d='M3 4.5l3 3 3-3'/></svg>\")" }}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("block text-[13px] font-medium text-foreground-muted mb-1.5", className)} {...props} />;
}

export function Field({ label, hint, error, children, className, htmlFor, required }: {
  label?: string; hint?: string; error?: string; children: React.ReactNode; className?: string; htmlFor?: string; required?: boolean;
}) {
  return (
    <div className={className}>
      {label && <Label htmlFor={htmlFor}>{label}{required && <span className="text-accent ml-0.5">*</span>}</Label>}
      {children}
      {error ? <p className="mt-1.5 text-xs text-danger">{error}</p> : hint ? <p className="mt-1.5 text-xs text-foreground-dim">{hint}</p> : null}
    </div>
  );
}
