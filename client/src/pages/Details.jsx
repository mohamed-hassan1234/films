import { Play, Plus, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MovieRow from "../components/MovieRow";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { contentImage, genreNames, minutes } from "../utils/content";

const Details = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const { activeProfile } = useAuth();

  useEffect(() => {
    api.get(`/movies/${id}`).then(({ data }) => setItem({ ...data, contentType: "Movie" })).catch(() => {
      api.get(`/series/${id}`).then(({ data }) => setItem({ ...data, contentType: "Series" }));
    });
  }, [id]);

  if (!item) return <main className="min-h-screen pt-24" />;
  const add = () => api.post(`/watchlist/${item._id}`, { contentType: item.contentType, profile: activeProfile?._id });

  return (
    <main className="min-h-screen pb-12">
      <section className="relative min-h-[66vh] bg-cover bg-center" style={{ backgroundImage: `url("${contentImage(item, "banner")}")` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-wave-deep to-transparent" />
        <div className="relative z-10 mx-auto flex min-h-[66vh] max-w-7xl items-end gap-8 px-4 pb-14 pt-28 md:px-8">
          <img src={contentImage(item)} alt={item.title} className="hidden w-56 rounded-lg object-cover shadow-2xl md:block" />
          <div className="max-w-3xl">
            <h1 className="text-4xl font-black md:text-6xl">{item.title}</h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-300">
              <span>{item.releaseYear}</span>
              <span>{minutes(item.duration)}</span>
              <span>{item.maturityLevel}</span>
              <span className="inline-flex items-center gap-1"><Star size={16} fill="currentColor" /> {item.rating}</span>
              <span>{genreNames(item)}</span>
            </div>
            <p className="mt-5 leading-7 text-zinc-200">{item.fullDescription || item.description}</p>
            <p className="mt-3 text-sm text-zinc-400">Cast: {(item.cast || []).join(", ") || "To be announced"}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={`/watch/${item._id}`} className="btn-primary"><Play fill="currentColor" /> Play</Link>
              <button onClick={add} className="btn-muted"><Plus /> Add to watchlist</button>
            </div>
          </div>
        </div>
      </section>
      <MovieRow title="Similar Titles" items={item.similar || []} />
    </main>
  );
};

export default Details;
