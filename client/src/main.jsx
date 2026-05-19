import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./pages/AppShell.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Browse from "./pages/Browse.jsx";
import Movies from "./pages/Movies.jsx";
import TVShows from "./pages/TVShows.jsx";
import Kids from "./pages/Kids.jsx";
import Search from "./pages/Search.jsx";
import Watch from "./pages/Watch.jsx";
import Details from "./pages/Details.jsx";
import Profile from "./pages/Profile.jsx";
import Watchlist from "./pages/Watchlist.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import AdminMovieForm from "./admin/AdminMovieForm.jsx";
import AdminMovies from "./admin/AdminMovies.jsx";
import AdminPlaceholder from "./admin/AdminPlaceholder.jsx";
import AdminSeries from "./admin/AdminSeries.jsx";
import AdminGenres from "./admin/AdminGenres.jsx";
import AdminUsers from "./admin/AdminUsers.jsx";
import AdminReports from "./admin/AdminReports.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/browse" element={<Browse />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/tv-shows" element={<TVShows />} />
              <Route path="/kids" element={<Kids />} />
              <Route path="/search" element={<Search />} />
              <Route path="/watch/:id" element={<Watch />} />
              <Route path="/details/:id" element={<Details />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/watchlist" element={<Watchlist />} />
            </Route>
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="movies" element={<AdminMovies />} />
              <Route path="movies/new" element={<AdminMovieForm />} />
              <Route path="movies/:id/edit" element={<AdminMovieForm />} />
              <Route path="series" element={<AdminSeries />} />
              <Route path="series/new" element={<AdminSeries />} />
              <Route path="genres" element={<AdminGenres />} />
              <Route path="upload-center" element={<AdminPlaceholder title="Upload Center" description="Track local uploads, storage, and publishing tasks from one calm workspace." />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminPlaceholder title="Settings" description="Configure admin preferences, content defaults, and platform options." />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
