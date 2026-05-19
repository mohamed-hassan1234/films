const LoadingSkeleton = () => (
  <div className="flex gap-3 overflow-hidden">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="h-64 w-40 shrink-0 animate-pulse rounded-lg bg-zinc-900 sm:w-48 lg:w-56" />
    ))}
  </div>
);

export default LoadingSkeleton;
