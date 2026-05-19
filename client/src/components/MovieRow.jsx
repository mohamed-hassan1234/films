import EmptyState from "./EmptyState";
import MovieCard from "./MovieCard";
import LoadingSkeleton from "./LoadingSkeleton";

const MovieRow = ({ title, items = [], loading, onWatchlist }) => (
  <section className="mx-auto max-w-7xl px-4 py-5 md:px-8">
    <h2 className="mb-3 text-xl font-bold md:text-2xl">{title}</h2>
    {loading ? (
      <LoadingSkeleton />
    ) : items.length ? (
      <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
        {items.map((item) => <MovieCard key={item._id} item={item} onWatchlist={onWatchlist} />)}
      </div>
    ) : (
      <EmptyState message="No titles found here yet." />
    )}
  </section>
);

export default MovieRow;
