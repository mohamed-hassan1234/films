import { Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import EmptyState from "../components/EmptyState";
import api from "../services/api";

const Search = () => {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) return setItems([]);
      const [movies, series] = await Promise.all([api.get(`/movies?search=${query}`), api.get(`/series?search=${query}`)]);
      setItems([...movies.data, ...series.data]);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-12 pt-24 md:px-8">
      <div className="flex items-center gap-3 rounded-lg border border-white/15 bg-wave-panel px-4">
        <SearchIcon className="text-zinc-400" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent py-4 outline-none" placeholder="Search title, genre, actor, year" />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => <MovieCard key={item._id} item={item} />)}
      </div>
      {query.length > 1 && !items.length && <div className="mt-8"><EmptyState message="No search results yet." /></div>}
    </main>
  );
};

export default Search;
