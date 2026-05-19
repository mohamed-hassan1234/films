import { useEffect, useState } from "react";
import AdminForm from "../components/AdminForm";
import AdminTable from "../components/AdminTable";
import api from "../services/api";

const AdminSeries = () => {
  const [items, setItems] = useState([]);
  const [genres, setGenres] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", genres: "", cast: "", releaseYear: new Date().getFullYear(), rating: 8, maturityLevel: "13+", featured: false, trending: false, trendingRank: 0 });
  const [files, setFiles] = useState({});
  const [season, setSeason] = useState({ series: "", seasonNumber: 1, title: "Season 1" });
  const [episode, setEpisode] = useState({ series: "", season: "", episodeNumber: 1, title: "", description: "", duration: 42 });

  const load = () => Promise.all([api.get("/series?limit=200"), api.get("/genres")]).then(([s, g]) => { setItems(s.data); setGenres(g.data); });
  useEffect(() => { load(); }, []);

  const submitSeries = async (event) => {
    event.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => fd.append(key, value));
    Object.entries(files).forEach(([key, file]) => file && fd.append(key, file));
    await api.post("/series/admin", fd);
    setForm({ ...form, title: "", description: "" });
    load();
  };

  const submitSeason = async (event) => {
    event.preventDefault();
    await api.post(`/series/admin/${season.series}/seasons`, { seasonNumber: season.seasonNumber, title: season.title });
    setSeason({ ...season, seasonNumber: Number(season.seasonNumber) + 1 });
  };

  const submitEpisode = async (event) => {
    event.preventDefault();
    const fd = new FormData();
    Object.entries(episode).forEach(([key, value]) => fd.append(key, value));
    Object.entries(files).forEach(([key, file]) => file && fd.append(key, file));
    await api.post(`/series/admin/${episode.series}/episodes`, fd);
    setEpisode({ ...episode, title: "", description: "", episodeNumber: Number(episode.episodeNumber) + 1 });
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black">Series Management</h1>
      <div className="grid gap-6 xl:grid-cols-3">
        <AdminForm title="Add Series" onSubmit={submitSeries}>
          <input className="field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="field" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <select multiple className="field h-28" onChange={(e) => setForm({ ...form, genres: Array.from(e.target.selectedOptions).map((o) => o.value).join(",") })}>{genres.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}</select>
          <input className="field" placeholder="Cast" value={form.cast} onChange={(e) => setForm({ ...form, cast: e.target.value })} />
          <input className="field" type="number" value={form.releaseYear} onChange={(e) => setForm({ ...form, releaseYear: e.target.value })} />
          <label className="text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
          <label className="text-sm"><input type="checkbox" checked={form.trending} onChange={(e) => setForm({ ...form, trending: e.target.checked })} /> Trending</label>
          {["poster", "banner", "thumbnail"].map((name) => <input key={name} className="field" type="file" accept="image/*" onChange={(e) => setFiles({ ...files, [name]: e.target.files[0] })} />)}
          <button className="btn-primary">Add Series</button>
        </AdminForm>
        <AdminForm title="Add Season" onSubmit={submitSeason}>
          <select className="field" value={season.series} onChange={(e) => setSeason({ ...season, series: e.target.value })} required><option value="">Select series</option>{items.map((item) => <option key={item._id} value={item._id}>{item.title}</option>)}</select>
          <input className="field" type="number" value={season.seasonNumber} onChange={(e) => setSeason({ ...season, seasonNumber: e.target.value })} />
          <input className="field" value={season.title} onChange={(e) => setSeason({ ...season, title: e.target.value })} />
          <button className="btn-primary">Add Season</button>
        </AdminForm>
        <AdminForm title="Add Episode" onSubmit={submitEpisode}>
          <select className="field" value={episode.series} onChange={(e) => setEpisode({ ...episode, series: e.target.value })} required><option value="">Select series</option>{items.map((item) => <option key={item._id} value={item._id}>{item.title}</option>)}</select>
          <input className="field" placeholder="Season ID" value={episode.season} onChange={(e) => setEpisode({ ...episode, season: e.target.value })} required />
          <input className="field" type="number" value={episode.episodeNumber} onChange={(e) => setEpisode({ ...episode, episodeNumber: e.target.value })} />
          <input className="field" placeholder="Episode title" value={episode.title} onChange={(e) => setEpisode({ ...episode, title: e.target.value })} />
          <textarea className="field" placeholder="Description" value={episode.description} onChange={(e) => setEpisode({ ...episode, description: e.target.value })} />
          <input className="field" type="file" accept="video/*" onChange={(e) => setFiles({ ...files, video: e.target.files[0] })} />
          <button className="btn-primary">Add Episode</button>
        </AdminForm>
      </div>
      <section className="mt-8">
        <AdminTable columns={[{ key: "title", label: "Title" }, { key: "releaseYear", label: "Year" }, { key: "rating", label: "Rating" }]} rows={items} renderActions={(item) => <button onClick={() => api.delete(`/series/admin/${item._id}`).then(load)} className="rounded bg-red-900 px-3 py-2">Delete</button>} />
      </section>
    </div>
  );
};

export default AdminSeries;
