import { useEffect, useMemo, useState } from "react";
import HeroBanner from "../components/HeroBanner";
import MovieRow from "../components/MovieRow";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Browse = () => {
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [history, setHistory] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const { activeProfile } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const [movieRes, seriesRes, historyRes, genreRes] = await Promise.all([
        api.get("/movies?limit=60"),
        api.get("/series?limit=20"),
        api.get(`/history/continue-watching${activeProfile?._id ? `?profile=${activeProfile._id}` : ""}`),
        api.get("/genres")
      ]);
      setMovies(movieRes.data);
      setSeries(seriesRes.data);
      setHistory(historyRes.data.map((item) => item.content).filter(Boolean));
      setGenres(genreRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activeProfile?._id]);

  const featured = useMemo(() => movies.find((item) => item.featured) || series.find((item) => item.featured) || movies[0], [movies, series]);
  const addWatchlist = (item) => api.post(`/watchlist/${item._id}`, { contentType: item.duration ? "Movie" : "Series", profile: activeProfile?._id });
  const byGenre = (name) => movies.filter((item) => item.genre === name || item.genres?.some((genre) => genre.name === name));
  const genreRows = (genres.length ? genres.map((genre) => genre.name) : ["Action", "Comedy", "Drama", "Documentary", "Anime", "Kids"])
    .map((name) => ({ name, items: byGenre(name) }))
    .filter((row) => row.items.length);

  return (
    <main className="pb-12">
      <HeroBanner item={featured} onWatchlist={addWatchlist} />
      <MovieRow title="Continue Watching" items={history} loading={loading} onWatchlist={addWatchlist} />
      <MovieRow title="Trending Now" items={movies.filter((item) => item.trending).sort((a, b) => a.trendingRank - b.trendingRank)} loading={loading} onWatchlist={addWatchlist} />
      <MovieRow title="New Releases" items={movies.slice().sort((a, b) => b.releaseYear - a.releaseYear)} loading={loading} onWatchlist={addWatchlist} />
      <MovieRow title="TV Shows" items={series} loading={loading} onWatchlist={addWatchlist} />
      {genreRows.map((row) => (
        <MovieRow key={row.name} title={row.name} items={row.items} loading={loading} onWatchlist={addWatchlist} />
      ))}
    </main>
  );
};

export default Browse;
