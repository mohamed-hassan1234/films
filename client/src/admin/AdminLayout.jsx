import { Bell, Search, UploadCloud, UserCircle } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-wave-deep text-white md:flex">
      <AdminSidebar />
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-wave-deep/95 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-wave-red">Admin Panel</p>
              <h1 className="text-2xl font-black">Content Management</h1>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-400 sm:w-80">
                <Search size={16} />
                <input className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-zinc-500" placeholder="Search movies, shows, users" />
              </label>
              <Link to="/admin/movies/new" className="btn-primary py-2">
                <UploadCloud size={18} />
                Upload
              </Link>
              <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white/10" aria-label="Notifications">
                <Bell size={18} />
              </button>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <UserCircle size={20} />
                <span className="max-w-32 truncate text-sm font-semibold">{user?.name || "Admin"}</span>
              </div>
            </div>
          </div>
        </header>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
