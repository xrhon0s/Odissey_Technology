export default function StoreLoading() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      aria-busy="true"
      aria-label="Cargando contenido"
      className="flex-1"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="skeleton-shimmer bg-surface-muted h-4 w-28 rounded-full" />
        <div className="skeleton-shimmer bg-surface-muted mt-5 h-12 max-w-xl rounded-2xl" />
        <div className="skeleton-shimmer bg-surface-muted mt-3 h-5 max-w-md rounded-full" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="border-line bg-surface rounded-[1.5rem] border p-2.5"
            >
              <div className="skeleton-shimmer bg-surface-muted aspect-square rounded-[1.15rem]" />
              <div className="skeleton-shimmer bg-surface-muted mt-4 h-4 w-2/3 rounded-full" />
              <div className="skeleton-shimmer bg-surface-muted mt-3 h-6 rounded-lg" />
              <div className="skeleton-shimmer bg-surface-muted mt-4 h-5 w-1/2 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
