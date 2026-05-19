import { Bell, Film, Menu, Search, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchModal from "./SearchModal";

const links = [
  ["Home", "/browse"],
  ["Movies", "/movies"],
  ["TV Shows", "/tv-shows"],
  ["Kids", "/kids"],
  ["Watchlist", "/watchlist"]
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, activeProfile, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 bg-gradient-to-b from-black via-black/80 to-transparent">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-6">
            <Link to="/browse" className="flex items-center gap-2 text-xl font-black tracking-wide text-wave-red">
              <Film size={28} fill="currentColor" />
              StreamWave
            </Link>
            <nav className="hidden items-center gap-5 text-sm text-zinc-300 md:flex">
              {links.map(([label, path]) => (
                <NavLink key={path} to={path} className={({ isActive }) => (isActive ? "text-white" : "hover:text-white")}>
                  {label}
                </NavLink>
              ))}
              {user?.role === "admin" && <NavLink to="/admin" className="hover:text-white">Admin</NavLink>}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button aria-label="Search" onClick={() => setSearchOpen(true)} className="rounded p-2 hover:bg-white/10">
              <Search size={21} />
            </button>
            <button aria-label="Notifications" className="hidden rounded p-2 hover:bg-white/10 sm:inline-flex">
              <Bell size={20} />
            </button>
            <button onClick={() => navigate("/profile")} className="hidden items-center gap-2 rounded bg-white/10 px-3 py-2 hover:bg-white/15 sm:flex">
              <UserRound size={18} />
              <span className="max-w-24 truncate text-sm">{activeProfile?.name || user?.name}</span>
            </button>
            <button className="rounded p-2 md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Menu">
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <div className="border-t border-white/10 bg-black px-4 py-4 md:hidden">
            {links.map(([label, path]) => (
              <Link key={path} to={path} onClick={() => setOpen(false)} className="block py-3 text-zinc-200">
                {label}
              </Link>
            ))}
            {user?.role === "admin" && <Link to="/admin" className="block py-3">Admin</Link>}
            <button onClick={logout} className="mt-2 text-sm text-zinc-400">Sign out</button>
          </div>
        )}
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
