import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import api, { toMediaUrl } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { contentImage } from "../utils/content";

const Watch = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const { activeProfile } = useAuth();
  const lastSavedSecond = useRef(-1);

  useEffect(() => {
    lastSavedSecond.current = -1;
    api.get(`/movies/${id}`).then(({ data }) => setItem({ ...data, contentType: "Movie" })).catch(() => {
      api.get(`/series/${id}`).then(({ data }) => setItem({ ...data, contentType: "Series" }));
    });
  }, [id]);

  const save = useCallback((progress, duration) => {
    const second = Math.floor(progress);
    if (!item?._id || second < 1 || second % 10 !== 0 || second === lastSavedSecond.current) return;
    lastSavedSecond.current = second;
    api.post("/history/progress", {
      contentId: item._id,
      contentType: item.contentType,
      profile: activeProfile?._id,
      progress,
      duration
    }).catch(() => {});
  }, [item?._id, item?.contentType, activeProfile?._id]);

  if (!item) return <main className="min-h-screen bg-black pt-24" />;
  return (
    <main className="min-h-screen bg-black px-4 pb-12 pt-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        <Link to={`/details/${item._id}`} className="mb-4 inline-block text-sm text-zinc-400 hover:text-white">Back to details</Link>
        <VideoPlayer src={toMediaUrl(item.videoUrl)} poster={contentImage(item, "banner")} onProgress={save} />
        <h1 className="mt-6 text-3xl font-bold">{item.title}</h1>
        <p className="mt-2 max-w-3xl text-zinc-300">{item.fullDescription || item.description}</p>
      </div>
    </main>
  );
};

export default Watch;
