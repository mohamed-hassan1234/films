import { BarChart3, Clapperboard, Database, Film, HardDrive, PlayCircle, UploadCloud, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { toMediaUrl } from "../services/api";

const formatBytes = (bytes = 0) => {
  if (!bytes) return "0 MB";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
};

const formatLimit = (mb = 0) => {
  if (!mb) return "not configured";
  if (mb >= 1024) return `${Number((mb / 1024).toFixed(1)).toLocaleString()} GB`;
  return `${Number(mb).toLocaleString()} MB`;
};

const StatCard = ({ label, value, icon: Icon, accent = "text-white" }) => (
  <div className="rounded-lg border border-white/10 bg-wave-panel p-5 shadow-2xl shadow-black/20">
    <div className="flex items-center justify-between">
      <div className="text-sm font-semibold text-zinc-400">{label}</div>
      <Icon className={accent} size={22} />
    </div>
    <div className="mt-3 text-4xl font-black">{value}</div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data));
  }, []);

  const storagePercent = useMemo(() => {
    const used = stats?.storageUsed || 0;
    const softLimit = stats?.uploadLimitBytes || 1024 * 1024 * 1024 * 1000;
    return Math.min(100, Math.round((used / softLimit) * 100));
  }, [stats]);

  const cards = [
    ["Total Movies", stats?.totalMovies || 0, Film, "text-wave-red"],
    ["Total TV Shows", stats?.totalSeries || 0, Clapperboard, "text-sky-300"],
    ["Total Users", stats?.totalUsers || 0, Users, "text-emerald-300"],
    ["Most Watched", stats?.mostWatched?.[0]?.title || "No views yet", PlayCircle, "text-amber-300"],
    ["Latest Uploads", stats?.recentlyAdded?.length || 0, UploadCloud, "text-purple-300"]
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-wave-red">Today in StreamWave</p>
          <h2 className="text-3xl font-black">Dashboard</h2>
          <p className="mt-1 text-zinc-400">A clean overview of movies, shows, users, uploads, and storage.</p>
        </div>
        <Link to="/admin/movies/new" className="btn-primary">
          <UploadCloud size={18} />
          Upload Movie
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value, Icon, accent]) => (
          <StatCard key={label} label={label} value={value} icon={Icon} accent={accent} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-lg border border-white/10 bg-wave-panel p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black">Recent Uploads</h3>
              <p className="text-sm text-zinc-500">Newest movies added to the catalog.</p>
            </div>
            <BarChart3 className="text-zinc-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-zinc-500">
                <tr>
                  <th className="py-3">Movie</th>
                  <th>Genre</th>
                  <th>Year</th>
                  <th>Views</th>
                  <th>Upload Date</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentlyAdded || []).map((movie) => (
                  <tr key={movie._id} className="border-t border-white/10">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-10 overflow-hidden rounded bg-white/10">
                          {(movie.poster || movie.posterUrl) && <img src={toMediaUrl(movie.poster || movie.posterUrl, "poster")} className="h-full w-full object-cover" alt="" />}
                        </div>
                        <span className="font-semibold">{movie.title}</span>
                      </div>
                    </td>
                    <td>{movie.genre || movie.genres?.[0]?.name || "Uncategorized"}</td>
                    <td>{movie.releaseYear}</td>
                    <td>{movie.views || 0}</td>
                    <td>{movie.createdAt ? new Date(movie.createdAt).toLocaleDateString() : "New"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-6">
          <section className="rounded-lg border border-white/10 bg-wave-panel p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black">Storage Usage</h3>
              <HardDrive className="text-zinc-500" />
            </div>
            <div className="mt-4 text-3xl font-black">{formatBytes(stats?.storageUsed || 0)}</div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-wave-red" style={{ width: `${storagePercent}%` }} />
            </div>
            <p className="mt-2 text-sm text-zinc-500">{storagePercent}% of the {formatLimit(stats?.uploadLimitMb)} upload limit.</p>
          </section>

          <section className="rounded-lg border border-white/10 bg-wave-panel p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black">Upload Statistics</h3>
              <Database className="text-zinc-500" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white/5 p-3">
                <div className="text-2xl font-black">{stats?.uploadsThisMonth || 0}</div>
                <div className="text-xs text-zinc-500">This month</div>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <div className="text-2xl font-black">{stats?.draftMovies || 0}</div>
                <div className="text-xs text-zinc-500">Draft movies</div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-wave-panel p-5">
            <h3 className="text-xl font-black">Latest Users</h3>
            <div className="mt-4 grid gap-3">
              {(stats?.latestUsers || []).map((user) => (
                <div key={user._id} className="flex items-center justify-between gap-3 rounded-lg bg-white/5 p-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{user.name}</div>
                    <div className="truncate text-xs text-zinc-500">{user.email}</div>
                  </div>
                  <span className="rounded bg-white/10 px-2 py-1 text-xs font-semibold">{user.role}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
