import { Play, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { contentImage, genreNames } from "../utils/content";

const MovieCard = ({ item, onWatchlist }) => (
  <article className="group relative w-40 shrink-0 overflow-hidden rounded-lg bg-wave-soft sm:w-48 lg:w-56">
    <Link to={`/details/${item._id}`}>
      <img src={contentImage(item)} alt={item.title} className="aspect-[2/3] w-full object-cover transition duration-300 group-hover:scale-105" />
    </Link>
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
      <h3 className="line-clamp-1 font-semibold">{item.title}</h3>
      <p className="line-clamp-1 text-xs text-zinc-300">{genreNames(item)}</p>
      <div className="mt-3 flex gap-2">
        <Link to={`/watch/${item._id}`} className="rounded-full bg-white p-2 text-black" aria-label="Play">
          <Play size={16} fill="currentColor" />
        </Link>
        <button onClick={() => onWatchlist?.(item)} className="rounded-full bg-white/20 p-2" aria-label="Add to watchlist">
          <Plus size={16} />
        </button>
      </div>
    </div>
  </article>
);

export default MovieCard;
