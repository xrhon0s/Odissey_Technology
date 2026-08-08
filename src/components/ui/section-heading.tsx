import type { ReactNode } from "react";

export function SectionHeading({
  action,
  description,
  eyebrow,
  id,
  title,
}: {
  action?: ReactNode;
  description?: string;
  eyebrow: string;
  id?: string;
  title: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        <p className="text-brand-dark flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
          <span
            className="bg-accent h-0.5 w-5 rounded-full"
            aria-hidden="true"
          />
          {eyebrow}
        </p>
        <h2
          id={id}
          className="font-display text-foreground mt-3 text-3xl leading-[1.05] font-bold tracking-[-0.04em] sm:text-4xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="text-muted mt-3 text-base leading-7">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
