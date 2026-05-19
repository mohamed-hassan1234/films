import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { contentImage } from "../utils/content";

const SearchModal = ({ open, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const [{ data: movies }, { data: series }] = await Promise.all([
        api.get(`/movies?search=${encodeURIComponent(query)}&limit=6`),
        api.get(`/series?search=${encodeURIComponent(query)}&limit=4`)
      ]);
      setResults([...movies, ...series]);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/85 p-4 backdrop-blur">
      <div className="mx-auto max-w-3xl pt-20">
        <div className="flex items-center gap-3 rounded-lg border border-white/15 bg-wave-panel px-4">
          <Search className="text-zinc-400" />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent py-4 outline-none" placeholder="Search title, actor, genre, or year" />
          <button onClick={onClose} aria-label="Close search"><X /></button>
        </div>
        <div className="mt-5 grid gap-3">
          {results.map((item) => (
            <Link key={item._id} to={`/details/${item._id}`} onClick={onClose} className="flex items-center gap-3 rounded-lg bg-white/5 p-2 hover:bg-white/10">
              <img src={contentImage(item)} alt={item.title} className="h-20 w-14 rounded object-cover" />
              <div>
                <div className="font-semibold">{item.title}</div>
                <div className="text-sm text-zinc-400">{item.releaseYear} • {item.maturityLevel}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
