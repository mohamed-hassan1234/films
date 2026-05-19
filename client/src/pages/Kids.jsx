import { useEffect, useState } from "react";
import MovieRow from "../components/MovieRow";
import api from "../services/api";

const Kids = () => {
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  useEffect(() => {
    Promise.all([api.get("/movies"), api.get("/series")]).then(([m, s]) => {
      setMovies(m.data.filter((item) => item.maturityLevel === "7+" || item.genres?.some((genre) => genre.name === "Kids")));
      setSeries(s.data.filter((item) => item.maturityLevel === "7+" || item.genres?.some((genre) => genre.name === "Kids")));
    });
  }, []);
  return (
    <main className="min-h-screen pb-12 pt-24">
      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <h1 className="text-3xl font-black">Kids</h1>
      </section>
      <MovieRow title="Family Movies" items={movies} />
      <MovieRow title="Animated Shows" items={series} />
    </main>
  );
};

export default Kids;
