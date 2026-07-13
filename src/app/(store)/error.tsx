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
        className="w-full rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
      >
        <h1 className="text-2xl font-bold text-slate-950">
          No pudimos cargar la tienda
        </h1>
        <p className="mt-3 text-slate-600">
          Puede ser un problema temporal. Intenta nuevamente en unos segundos.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Intentar de nuevo
        </button>
      </div>
    </main>
  );
}
