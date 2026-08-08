import type { ReactNode } from "react";

export function AdminPageHeader({
  action,
  description,
  eyebrow,
  title,
}: {
  action?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <header className="border-line flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-brand-dark text-xs font-extrabold tracking-[0.18em] uppercase">
          {eyebrow}
        </p>
        <h1 className="font-display text-foreground mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6 sm:text-base">
          {description}
        </p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
