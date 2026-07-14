import Image from "next/image";

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span
      className={`inline-flex ${inverse ? "rounded-xl bg-white px-3 py-2" : ""}`}
    >
      <Image
        src="/images/odissey-logo.webp"
        alt="Odissey Technology"
        width={2157}
        height={389}
        priority={!inverse}
        sizes="(min-width: 640px) 210px, 150px"
        className="h-auto w-[150px] sm:w-[210px]"
      />
    </span>
  );
}
