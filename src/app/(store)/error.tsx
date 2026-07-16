"use client";

export default function StoreError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-6 py-20">
      <div
        role="alert"
        className="w-full rounded-[2rem] border border-red-200 bg-red-50 p-8 text-center"
      >
        <h1 className="font-display text-foreground text-2xl font-bold">
          No pudimos cargar la tienda
        </h1>
        <p className="text-muted mt-3">
          Puede ser un problema temporal. Intenta nuevamente en unos segundos.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="bg-foreground hover:bg-brand-dark mt-6 rounded-full px-5 py-3 text-sm font-semibold text-white transition"
        >
          Intentar de nuevo
        </button>
      </div>
    </main>
  );
}
