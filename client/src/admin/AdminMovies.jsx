import { Calendar, Edit3, Eye, Film, PlusCircle, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { toMediaUrl } from "../services/api";

const genreName = (movie) => movie.genre || movie.genres?.[0]?.name || "Uncategorized";

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const years = useMemo(() => {
    const values = new Set(movies.map((movie) => movie.releaseYear).filter(Boolean));
    return [...values].sort((a, b) => b - a);
  }, [movies]);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "8", page: String(page) });
    if (query) params.set("search", query);
    if (genre) params.set("genre", genre);
    if (year) params.set("year", year);

    Promise.all([api.get(`/admin/movies?${params.toString()}`), api.get("/genres")])
      .then(([movieResponse, genreResponse]) => {
        setMovies(movieResponse.data.movies || movieResponse.data);
        setPages(movieResponse.data.pages || 1);
        setGenres(genreResponse.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const handle = setTimeout(load, 250);
    return () => clearTimeout(handle);
  }, [query, genre, year, page]);

  const remove = async (movie) => {
    if (!window.confirm(`Delete "${movie.title}"?`)) return;
    await api.delete(`/admin/movies/${movie._id}`);
    load();
  };

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-wave-red">Movie Library</p>
          <h2 className="text-3xl font-black">All Movies</h2>
          <p className="mt-1 text-zinc-400">Search, filter, edit, view, and delete uploaded movies.</p>
        </div>
        <Link to="/admin/movies/new" className="btn-primary">
          <PlusCircle size={18} />
          Add Movie
        </Link>
      </div>

      <section className="mt-6 rounded-lg border border-white/10 bg-wave-panel p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px]">
          <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2">
            <Search size={17} className="text-zinc-500" />
            <input className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-zinc-500" value={query} onChange={(event) => { setPage(1); setQuery(event.target.value); }} placeholder="Search movie title, cast, director" />
          </label>
          <select className="field py-2" value={genre} onChange={(event) => { setPage(1); setGenre(event.target.value); }}>
            <option value="">All genres</option>
            {genres.map((item) => (
              <option key={item._id} value={item._id}>{item.name}</option>
            ))}
          </select>
          <select className="field py-2" value={year} onChange={(event) => { setPage(1); setYear(event.target.value); }}>
            <option value="">All years</option>
            {years.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-96 animate-pulse rounded-lg bg-white/5" />)
        ) : movies.length ? (
          movies.map((movie) => (
            <article key={movie._id} className="overflow-hidden rounded-lg border border-white/10 bg-wave-panel shadow-2xl shadow-black/20">
              <div className="aspect-[2/3] bg-white/5">
                {movie.poster || movie.posterUrl ? (
                  <img src={toMediaUrl(movie.poster || movie.posterUrl, "poster")} alt={movie.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-zinc-500">
                    <Film size={36} />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-lg font-black">{movie.title}</h3>
                  {movie.status === "draft" && <span className="rounded bg-white/10 px-2 py-1 text-xs font-semibold text-zinc-300">Draft</span>}
                </div>
                <p className="mt-1 text-sm text-zinc-400">{genreName(movie)} • {movie.releaseYear}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400">
                  <span className="rounded bg-white/5 px-2 py-2">Views: {movie.views || 0}</span>
                  <span className="rounded bg-white/5 px-2 py-2">
                    <Calendar size={13} className="mr-1 inline" />
                    {movie.createdAt ? new Date(movie.createdAt).toLocaleDateString() : "New"}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Link className="btn-muted px-2 py-2" to={`/details/${movie._id}`} title="View movie">
                    <Eye size={16} />
                  </Link>
                  <Link className="btn-muted px-2 py-2" to={`/admin/movies/${movie._id}/edit`} title="Edit movie">
                    <Edit3 size={16} />
                  </Link>
                  <button className="inline-flex items-center justify-center rounded bg-red-950 px-2 py-2 text-red-100 transition hover:bg-red-900" onClick={() => remove(movie)} title="Delete movie">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full rounded-lg border border-white/10 bg-wave-panel p-10 text-center">
            <Film className="mx-auto text-zinc-500" size={40} />
            <h3 className="mt-3 text-xl font-black">No movies found</h3>
            <p className="mt-1 text-zinc-400">Try another search or add your first movie.</p>
          </div>
        )}
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">Page {page} of {pages}</p>
        <div className="flex gap-2">
          <button className="btn-muted disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
          <button className="btn-muted disabled:opacity-40" disabled={page >= pages} onClick={() => setPage((current) => Math.min(pages, current + 1))}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default AdminMovies;
