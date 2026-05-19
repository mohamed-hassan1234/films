import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";
import MovieCard from "../components/MovieCard";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Watchlist = () => {
  const [items, setItems] = useState([]);
  const { activeProfile } = useAuth();
  useEffect(() => {
    const cacheKey = `streamwave_watchlist_${activeProfile?._id || "default"}`;
    const cached = JSON.parse(localStorage.getItem(cacheKey) || "[]");
    if (cached.length) setItems(cached);
    api.get(`/watchlist${activeProfile?._id ? `?profile=${activeProfile._id}` : ""}`).then(({ data }) => {
      const nextItems = data.map((item) => item.content).filter(Boolean);
      setItems(nextItems);
      localStorage.setItem(cacheKey, JSON.stringify(nextItems));
    });
  }, [activeProfile?._id]);
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-12 pt-24 md:px-8">
      <h1 className="mb-6 text-3xl font-black">My Watchlist</h1>
      {items.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => <MovieCard key={item._id} item={item} />)}
        </div>
      ) : <EmptyState message="Your watchlist is empty." />}
    </main>
  );
};

export default Watchlist;
