import { cn } from "@/lib/utils";

export function SectionHeading({
  index,
  eyebrow,
  title,
  accent,
  description,
  id,
  className,
  align = "split",
}: {
  index: string;
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
  id?: string;
  className?: string;
  align?: "split" | "stack";
}) {
  return (
    <div className={cn("grid gap-6", align === "split" && "lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16", className)}>
      <div>
        <p className="eyebrow flex items-center gap-3">
          <span className="num text-accent">{index}</span>
          <span className="h-px w-6 bg-border-strong" />
          {eyebrow}
        </p>
        <h2 id={id} className="mt-5 text-balance text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
          {title}
          {accent && (
            <>
              {" "}
              <span className="font-display font-normal italic tracking-[-0.01em] text-foreground-muted">{accent}</span>
            </>
          )}
        </h2>
      </div>
      {description && <p className="max-w-xl text-pretty text-base leading-relaxed text-foreground-muted lg:justify-self-end">{description}</p>}
    </div>
  );
}
