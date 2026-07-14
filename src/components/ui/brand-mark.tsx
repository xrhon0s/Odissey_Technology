export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-2.5"
      aria-label="Odissey Technology"
    >
      <span
        aria-hidden="true"
        className={`relative grid size-9 place-items-center overflow-hidden rounded-[13px] ${inverse ? "bg-white" : "bg-brand"}`}
      >
        <span
          className={`absolute size-5 rounded-full border-[3px] ${inverse ? "border-brand" : "border-white"}`}
        />
        <span className="bg-accent absolute right-1.5 bottom-1.5 size-2 rounded-full" />
      </span>
      <span className="leading-none">
        <span className="font-display block text-[15px] font-black tracking-[-0.03em]">
          ODISSEY
        </span>
        <span
          className={`mt-0.5 block text-[8px] font-black tracking-[0.28em] ${inverse ? "text-blue-200" : "text-muted"}`}
        >
          TECHNOLOGY
        </span>
      </span>
    </span>
  );
}
