export default function CatalogLoading() {
  return (
    <main
      className="bg-background flex-1"
      aria-busy="true"
      aria-label="Cargando catálogo"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="skeleton-shimmer bg-surface-muted h-10 w-64 rounded-xl" />
        <div className="skeleton-shimmer bg-surface-muted mt-8 h-28 rounded-2xl" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="skeleton-shimmer bg-surface-muted aspect-[3/4] rounded-2xl"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
