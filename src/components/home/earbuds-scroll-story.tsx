"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";

const explodedPieces = [
  {
    id: "earbuds",
    clipPath: "inset(0 0 76% 0)",
    startX: 0,
    startY: 220,
    startScale: 0.64,
    startRotation: 0,
  },
  {
    id: "left-stems",
    clipPath: "inset(15% 68% 60% 0)",
    startX: 210,
    startY: 110,
    startScale: 0.72,
    startRotation: 4,
  },
  {
    id: "right-stems",
    clipPath: "inset(15% 0 60% 68%)",
    startX: -210,
    startY: 110,
    startScale: 0.72,
    startRotation: -4,
  },
  {
    id: "lid",
    clipPath: "inset(21% 24% 60% 24%)",
    startX: 0,
    startY: 135,
    startScale: 0.72,
    startRotation: 0,
  },
  {
    id: "hinge",
    clipPath: "inset(38% 31% 55% 31%)",
    startX: 0,
    startY: 55,
    startScale: 0.82,
    startRotation: 0,
  },
  {
    id: "cradle",
    clipPath: "inset(43% 23% 43% 23%)",
    startX: 0,
    startY: -50,
    startScale: 0.78,
    startRotation: 0,
  },
  {
    id: "circuit",
    clipPath: "inset(56% 31% 35% 31%)",
    startX: 0,
    startY: -125,
    startScale: 0.82,
    startRotation: 0,
  },
  {
    id: "battery",
    clipPath: "inset(63% 31% 27% 31%)",
    startX: 0,
    startY: -170,
    startScale: 0.82,
    startRotation: 0,
  },
  {
    id: "case-shell",
    clipPath: "inset(72% 23% 0 23%)",
    startX: 0,
    startY: -255,
    startScale: 0.72,
    startRotation: 0,
  },
] as const;

export function EarbudsScrollStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const scene = sceneRef.current;

    if (!section || !scene) return;

    let disposed = false;
    let cleanupAnimation: (() => void) | undefined;

    async function initializeAnimation() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (disposed || !section || !scene) return;

      gsap.registerPlugin(ScrollTrigger);

      let media: ReturnType<typeof gsap.matchMedia> | undefined;

      const context = gsap.context(() => {
        const assembled = scene.querySelector<HTMLElement>("[data-assembled]");
        const pieces = Array.from(
          scene.querySelectorAll<HTMLElement>("[data-piece]"),
        );
        const introCopy = scene.querySelector<HTMLElement>(
          '[data-copy="intro"]',
        );
        const explodedCopy = scene.querySelector<HTMLElement>(
          '[data-copy="exploded"]',
        );
        const finalCopy = scene.querySelector<HTMLElement>(
          '[data-copy="final"]',
        );
        const progress = scene.querySelector<HTMLElement>("[data-progress]");

        if (
          !assembled ||
          pieces.length === 0 ||
          !introCopy ||
          !explodedCopy ||
          !finalCopy ||
          !progress
        ) {
          return;
        }

        media = gsap.matchMedia();

        media.add("(prefers-reduced-motion: reduce)", () => {
          gsap.set(pieces, { autoAlpha: 0 });
          gsap.set([introCopy, explodedCopy], { autoAlpha: 0 });
          gsap.set(finalCopy, { autoAlpha: 1, y: 0 });
          gsap.set(assembled, { autoAlpha: 1, scale: 1 });
        });

        media.add(
          {
            animate: "(prefers-reduced-motion: no-preference)",
            desktop: "(min-width: 768px)",
          },
          (mediaContext) => {
            if (!mediaContext.conditions?.animate) return;

            const compact = !mediaContext.conditions?.desktop;
            const distanceScale = compact ? 0.56 : 1;

            gsap.set(pieces, {
              autoAlpha: 0,
              x: (index) =>
                Number(pieces[index]?.dataset.startX ?? 0) * distanceScale,
              y: (index) =>
                Number(pieces[index]?.dataset.startY ?? 0) * distanceScale,
              rotation: (index) =>
                Number(pieces[index]?.dataset.startRotation ?? 0),
              scale: (index) => Number(pieces[index]?.dataset.startScale ?? 1),
              transformOrigin: "50% 50%",
            });
            gsap.set([explodedCopy, finalCopy], { autoAlpha: 0, y: 24 });
            gsap.set(introCopy, { autoAlpha: 1, y: 0 });
            gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });

            const timeline = gsap.timeline({
              defaults: { ease: "power2.inOut" },
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
                invalidateOnRefresh: true,
              },
            });

            timeline
              .to(progress, { scaleX: 1, duration: 5, ease: "none" }, 0)
              .to(introCopy, { autoAlpha: 0, y: -24, duration: 0.55 }, 0.2)
              .to(assembled, { autoAlpha: 0, scale: 0.84, duration: 0.9 }, 0.25)
              .to(
                pieces,
                {
                  autoAlpha: 1,
                  x: 0,
                  y: 0,
                  rotation: 0,
                  scale: 1,
                  duration: 1.55,
                  stagger: 0.035,
                },
                0.45,
              )
              .to(explodedCopy, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.45)
              .to({}, { duration: 0.7 })
              .to(explodedCopy, { autoAlpha: 0, y: -18, duration: 0.45 })
              .to(
                pieces,
                {
                  autoAlpha: 0,
                  x: (index) =>
                    Number(pieces[index]?.dataset.startX ?? 0) * distanceScale,
                  y: (index) =>
                    Number(pieces[index]?.dataset.startY ?? 0) * distanceScale,
                  rotation: (index) =>
                    Number(pieces[index]?.dataset.startRotation ?? 0),
                  scale: (index) =>
                    Number(pieces[index]?.dataset.startScale ?? 1),
                  duration: 1.15,
                  stagger: { each: 0.025, from: "end" },
                },
                ">-0.1",
              )
              .to(
                assembled,
                { autoAlpha: 1, scale: 1, duration: 0.95 },
                ">-0.65",
              )
              .to(finalCopy, { autoAlpha: 1, y: 0, duration: 0.65 }, ">-0.45");
          },
        );
      }, section);

      cleanupAnimation = () => {
        media?.revert();
        context.revert();
      };
    }

    void initializeAnimation();

    return () => {
      disposed = true;
      cleanupAnimation?.();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="earbuds-story-title"
      className="bg-foreground relative h-[250svh] text-white motion-reduce:h-auto md:h-[320svh]"
    >
      <div
        ref={sceneRef}
        className="sticky top-0 isolate flex h-svh min-h-[38rem] items-center overflow-hidden motion-reduce:relative motion-reduce:h-auto motion-reduce:min-h-[42rem]"
      >
        <div
          aria-hidden="true"
          className="bg-brand/15 absolute top-1/2 left-1/2 -z-10 size-[min(92vw,54rem)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
        />
        <div
          aria-hidden="true"
          className="border-brand/20 absolute top-1/2 left-1/2 -z-10 aspect-square w-[min(82vw,48rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        />
        <div
          aria-hidden="true"
          className="border-accent/15 absolute top-1/2 left-1/2 -z-10 aspect-square w-[min(62vw,36rem)] -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-full border"
        />

        <div className="absolute top-5 right-5 left-5 z-30 mx-auto flex max-w-7xl items-center gap-4 px-1 sm:top-8 sm:px-6">
          <span className="text-brand text-[10px] font-bold tracking-[0.2em] uppercase sm:text-xs">
            Ingeniería del sonido
          </span>
          <span className="h-px flex-1 bg-white/15" />
          <span className="text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase sm:text-xs">
            Desliza para explorar
          </span>
        </div>

        <div className="absolute top-[4.65rem] right-5 left-5 z-30 mx-auto h-px max-w-7xl overflow-hidden bg-white/10 sm:top-[6rem] sm:right-11 sm:left-11">
          <span
            data-progress
            aria-hidden="true"
            className="bg-brand block h-full w-full shadow-[0_0_16px_var(--brand)]"
          />
        </div>

        <div className="relative mx-auto h-[min(84vw,46rem)] w-[min(84vw,46rem)] shrink-0 sm:h-[min(76vw,48rem)] sm:w-[min(76vw,48rem)]">
          <div
            data-assembled
            className="absolute inset-[8%] will-change-transform"
          >
            <Image
              src="/images/hero-wireless-earbuds.webp"
              alt="Audífonos inalámbricos blancos sobre su estuche de carga"
              fill
              sizes="(max-width: 767px) 84vw, 48rem"
              className="rounded-[2rem] object-cover object-center shadow-[0_30px_90px_rgb(0_0_0/0.28)]"
            />
          </div>

          {explodedPieces.map((piece) => (
            <div
              key={piece.id}
              data-piece={piece.id}
              data-start-rotation={piece.startRotation}
              data-start-scale={piece.startScale}
              data-start-x={piece.startX}
              data-start-y={piece.startY}
              aria-hidden="true"
              className="absolute inset-0 opacity-0 will-change-transform"
              style={{ clipPath: piece.clipPath }}
            >
              <Image
                src="/images/earbuds-exploded.webp"
                alt=""
                fill
                sizes="(max-width: 767px) 84vw, 48rem"
                className="object-contain drop-shadow-[0_18px_24px_rgb(0_0_0/0.22)]"
              />
            </div>
          ))}
        </div>

        <div
          data-copy="intro"
          className="absolute right-5 bottom-12 left-5 z-20 mx-auto max-w-7xl sm:bottom-16 sm:px-6"
        >
          <p className="text-brand text-xs font-bold tracking-[0.18em] uppercase">
            Más que sonido
          </p>
          <h2
            id="earbuds-story-title"
            className="font-display mt-2 max-w-xl text-3xl font-bold tracking-[-0.045em] text-balance sm:text-5xl"
          >
            Descubre lo que hay detrás de cada conexión.
          </h2>
        </div>

        <div
          data-copy="exploded"
          className="pointer-events-none absolute top-24 right-5 left-5 z-20 mx-auto max-w-7xl opacity-0 sm:top-32 sm:px-6"
        >
          <div className="bg-foreground/70 max-w-sm rounded-[1.5rem] border border-white/15 p-5 shadow-2xl backdrop-blur-md sm:p-6">
            <p className="text-accent text-xs font-bold tracking-[0.18em] uppercase">
              Tecnología por dentro
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-200 sm:text-base">
              Cada pieza trabaja en conjunto para que tu música te acompañe sin
              detener tu ritmo.
            </p>
          </div>
        </div>

        <div
          data-copy="final"
          className="absolute right-5 bottom-10 left-5 z-20 mx-auto flex max-w-7xl flex-col items-start gap-5 opacity-0 sm:bottom-14 sm:px-6 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="text-brand text-xs font-bold tracking-[0.18em] uppercase">
              Odissey Technology
            </p>
            <p className="font-display mt-2 max-w-2xl text-3xl font-bold tracking-[-0.045em] text-balance sm:text-5xl">
              Listos para conectarte.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="bg-brand hover:bg-brand-dark text-foreground inline-flex min-h-12 items-center rounded-full px-6 py-3 text-sm font-bold transition hover:-translate-y-0.5 hover:text-white"
          >
            Ver audífonos <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
