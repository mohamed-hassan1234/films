import { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const { activeProfile } = useAuth();
  useEffect(() => { api.get("/movies").then(({ data }) => setMovies(data)); }, []);
  const add = (item) => api.post(`/watchlist/${item._id}`, { contentType: "Movie", profile: activeProfile?._id });
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-12 pt-24 md:px-8">
      <h1 className="mb-6 text-3xl font-black">Movies</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((item) => <MovieCard key={item._id} item={item} onWatchlist={add} />)}
      </div>
    </main>
  );
};

export default Movies;
