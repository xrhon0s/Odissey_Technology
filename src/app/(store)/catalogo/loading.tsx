export default function CatalogLoading() {
  return (
    <main
      className="flex-1 bg-slate-50"
      aria-busy="true"
      aria-label="Cargando catálogo"
    >
      <div className="mx-auto max-w-6xl animate-pulse px-4 py-14 sm:px-6">
        <div className="h-10 w-64 rounded bg-slate-200" />
        <div className="mt-8 h-28 rounded-2xl bg-slate-200" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="aspect-[3/4] rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    </main>
  );
}
