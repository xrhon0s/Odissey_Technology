"use client";

import Image from "next/image";
import { useState } from "react";

type ProductGalleryImage = {
  altText: string;
  id: string;
  url: string;
};

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductGalleryImage[];
  productName: string;
}) {
  const [selectedId, setSelectedId] = useState(images[0]?.id ?? null);
  const selectedImage =
    images.find((image) => image.id === selectedId) ?? images[0];

  return (
    <div>
      <div className="bg-surface-muted relative aspect-square overflow-hidden rounded-[2rem]">
        {selectedImage ? (
          <Image
            key={selectedImage.id}
            src={selectedImage.url}
            alt={selectedImage.altText}
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="page-enter object-cover"
          />
        ) : (
          <div className="text-muted flex h-full flex-col items-center justify-center gap-5">
            <span
              aria-hidden="true"
              className="border-brand/20 text-brand grid size-32 place-items-center rounded-full border-[22px] text-4xl font-bold"
            >
              •
            </span>
            <span className="text-sm font-bold">Imagen próximamente</span>
          </div>
        )}
        <span className="bg-surface text-foreground absolute top-4 left-4 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wide uppercase shadow-sm">
          Disponible en Colombia
        </span>
      </div>

      {images.length > 1 ? (
        <div
          className="mt-3 grid grid-cols-4 gap-3"
          aria-label={`Galería de ${productName}`}
        >
          {images.slice(0, 4).map((image) => {
            const isSelected = image.id === selectedImage?.id;

            return (
              <button
                key={image.id}
                type="button"
                aria-label={`Ver ${image.altText}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedId(image.id)}
                className={`bg-surface-muted relative aspect-square overflow-hidden rounded-[1.1rem] border-2 transition ${
                  isSelected
                    ? "border-brand shadow-sm"
                    : "hover:border-line border-transparent"
                }`}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 12vw, 25vw"
                  className="object-cover transition duration-300 hover:scale-105"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
