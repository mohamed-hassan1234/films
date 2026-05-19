import { Info, Play, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { contentImage, genreNames, minutes } from "../utils/content";

const HeroBanner = ({ item, onWatchlist }) => {
  if (!item) return <div className="h-[72vh] animate-pulse bg-zinc-900" />;
  return (
    <section
      className="relative min-h-[72vh] bg-cover bg-center"
      style={{ backgroundImage: `url("${contentImage(item, "banner")}")` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-wave-deep via-transparent to-black/50" />
      <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-7xl items-end px-4 pb-20 pt-28 md:px-8">
        <div className="max-w-2xl">
          <div className="mb-3 text-sm font-semibold uppercase tracking-[.28em] text-wave-red">Featured on StreamWave</div>
          <h1 className="text-4xl font-black md:text-7xl">{item.title}</h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-300">
            <span>{item.releaseYear}</span>
            <span>{minutes(item.duration)}</span>
            <span>{item.maturityLevel}</span>
            <span>{genreNames(item)}</span>
          </div>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-200 md:text-lg">{item.description}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to={`/watch/${item._id}`} className="btn-primary">
              <Play size={20} fill="currentColor" /> Play
            </Link>
            <Link to={`/details/${item._id}`} className="btn-muted">
              <Info size={20} /> Details
            </Link>
            <button onClick={() => onWatchlist?.(item)} className="btn-muted">
              <Plus size={20} /> Watchlist
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
