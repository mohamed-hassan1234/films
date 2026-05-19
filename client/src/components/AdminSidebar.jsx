import {
  BarChart3,
  Clapperboard,
  Film,
  Folder,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorUp,
  PlusCircle,
  Search,
  Settings,
  UploadCloud,
  Users,
  X
} from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  ["Dashboard", "/admin", LayoutDashboard, true],
  ["Add Movie", "/admin/movies/new", PlusCircle],
  ["Add TV Show", "/admin/series/new", MonitorUp],
  ["All Movies", "/admin/movies", Film],
  ["All TV Shows", "/admin/series", Clapperboard],
  ["Categories", "/admin/genres", Folder],
  ["Upload Center", "/admin/upload-center", UploadCloud],
  ["Users", "/admin/users", Users],
  ["Analytics", "/admin/reports", BarChart3],
  ["Settings", "/admin/settings", Settings]
];

const AdminSidebar = () => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const logoutAdmin = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-black px-4 py-3 md:hidden">
        <div className="text-xl font-black text-wave-red">StreamWave</div>
        <button className="rounded border border-white/10 p-2 text-white" onClick={() => setOpen(true)} aria-label="Open admin menu">
          <Menu size={20} />
        </button>
      </div>

      {open && <button className="fixed inset-0 z-40 bg-black/70 md:hidden" onClick={() => setOpen(false)} aria-label="Close admin menu" />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-black p-4 transition md:sticky md:top-0 md:z-auto md:min-h-screen md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-wave-red">StreamWave</div>
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">Admin Studio</div>
          </div>
          <button className="rounded border border-white/10 p-2 text-zinc-300 md:hidden" onClick={() => setOpen(false)} aria-label="Close admin menu">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-400">
          <Search size={16} />
          <span>Search content</span>
        </div>

        <nav className="grid gap-1">
          {links.map(([label, path, Icon, exact]) => (
            <NavLink
              key={path}
              to={path}
              end={Boolean(exact)}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                  isActive ? "bg-wave-red text-white shadow-glow" : "text-zinc-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logoutAdmin}
          className="mt-6 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>
    </>
  );
};

export default AdminSidebar;
