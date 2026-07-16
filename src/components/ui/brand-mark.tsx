import Image from "next/image";

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className="inline-flex">
      <Image
        src={
          inverse
            ? "/images/odissey-logo-white.png"
            : "/images/odissey-logo.webp"
        }
        alt="Odissey Technology"
        width={inverse ? 581 : 2157}
        height={inverse ? 108 : 389}
        priority={!inverse}
        sizes="(min-width: 640px) 210px, 128px"
        className="h-auto w-[128px] sm:w-[210px]"
      />
    </span>
  );
}
