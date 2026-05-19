import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  FileVideo,
  Image,
  Loader2,
  Save,
  Trash2,
  UploadCloud,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { toMediaUrl } from "../services/api";

const currentYear = new Date().getFullYear();

const blankMovie = {
  title: "",
  shortDescription: "",
  fullDescription: "",
  genreId: "",
  genre: "",
  releaseYear: currentYear,
  duration: "",
  language: "English",
  country: "",
  ageRating: "13+",
  featured: false,
  trending: false,
  cast: "",
  director: "",
  writer: "",
  productionCompany: "",
  imdbRating: 7,
  status: "published",
  posterUrl: "",
  bannerUrl: "",
  thumbnailUrl: "",
  videoUrl: ""
};

const imageAccept = "image/jpeg,image/png,image/webp";
const videoAccept = "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v";
const configuredChunkMb = Number(import.meta.env.VITE_VIDEO_CHUNK_MB || 0.5);
const initialVideoChunkSize = 1024 * 1024 * (Number.isFinite(configuredChunkMb) && configuredChunkMb > 0 ? configuredChunkMb : 0.5);
const minVideoChunkSize = 128 * 1024;

const formatBytes = (bytes = 0) => {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
};

const fieldClass =
  "w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-wave-red focus:bg-black/70";

const Section = ({ number, title, children }) => (
  <section className="rounded-lg border border-white/10 bg-wave-panel p-5 shadow-2xl shadow-black/20">
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-wave-red text-sm font-black">{number}</span>
      <h2 className="text-lg font-black">{title}</h2>
    </div>
    {children}
  </section>
);

const Label = ({ label, hint, children }) => (
  <label className="grid gap-2">
    <span className="text-sm font-semibold text-zinc-200">{label}</span>
    {children}
    {hint && <span className="text-xs text-zinc-500">{hint}</span>}
  </label>
);

const UploadDropzone = ({ name, title, description, accept, file, existingUrl, progress, onPick, onRemove, video }) => {
  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    return toMediaUrl(existingUrl);
  }, [file, existingUrl]);

  useEffect(() => {
    return () => {
      if (file && previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [file, previewUrl]);

  const handleDrop = (event) => {
    event.preventDefault();
    const picked = event.dataTransfer.files?.[0];
    if (picked) onPick(name, picked);
  };

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      className="rounded-lg border border-dashed border-white/20 bg-black/30 p-4 transition hover:border-wave-red/70 hover:bg-black/50"
    >
      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <div className="flex min-h-36 items-center justify-center overflow-hidden rounded-lg bg-white/5">
          {previewUrl ? (
            video ? (
              <video src={previewUrl} className="h-full max-h-48 w-full object-cover" controls />
            ) : (
              <img src={previewUrl} alt={title} className="h-full max-h-48 w-full object-cover" />
            )
          ) : (
            <div className="grid place-items-center gap-2 text-zinc-500">
              {video ? <FileVideo size={34} /> : <Image size={34} />}
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">Preview</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center gap-3">
          <div>
            <h3 className="font-black">{title}</h3>
            <p className="mt-1 text-sm text-zinc-400">{description}</p>
          </div>
          {file && (
            <div className="rounded-lg bg-white/5 p-3 text-sm text-zinc-300">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-white">{file.name}</span>
                <span>{formatBytes(file.size)}</span>
              </div>
              {progress > 0 && (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-wave-red transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
              {progress > 0 && <div className="mt-1 text-xs text-zinc-400">{progress}% uploaded</div>}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <label className="btn-muted cursor-pointer py-2">
              <UploadCloud size={17} />
              {file || existingUrl ? "Change file" : video ? "Click or drag movie file here" : "Choose file"}
              <input className="hidden" type="file" accept={accept} onChange={(event) => onPick(name, event.target.files?.[0])} />
            </label>
            {(file || existingUrl) && (
              <button type="button" className="btn-muted py-2" onClick={() => onRemove(name)}>
                <Trash2 size={16} />
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminMovieForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [genres, setGenres] = useState([]);
  const [form, setForm] = useState(blankMovie);
  const [files, setFiles] = useState({});
  const [removed, setRemoved] = useState({});
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("published");

  useEffect(() => {
    api.get("/genres").then(({ data }) => setGenres(data));
  }, []);

  useEffect(() => {
    if (!editing) return;
    api.get(`/admin/movies/${id}`).then(({ data }) => {
      const movie = data.similar ? { ...data, similar: undefined } : data;
      const firstGenre = movie.genres?.[0];
      setForm({
        ...blankMovie,
        ...movie,
        shortDescription: movie.shortDescription || movie.description || "",
        fullDescription: movie.fullDescription || movie.description || "",
        genreId: firstGenre?._id || "",
        genre: movie.genre || firstGenre?.name || "",
        ageRating: movie.ageRating || movie.maturityLevel || "13+",
        imdbRating: movie.imdbRating || movie.rating || 7,
        cast: (movie.cast || movie.actors || []).join(", "),
        posterUrl: movie.poster || movie.posterUrl || "",
        bannerUrl: movie.banner || movie.bannerUrl || "",
        thumbnailUrl: movie.thumbnail || movie.thumbnailUrl || "",
        videoUrl: movie.videoUrl || "",
        status: movie.status || "published"
      });
    });
  }, [editing, id]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const pickFile = (name, file) => {
    if (!file) return;
    setFiles((current) => ({ ...current, [name]: file }));
    setRemoved((current) => ({ ...current, [name]: false }));
  };

  const removeFile = (name) => {
    setFiles((current) => ({ ...current, [name]: null }));
    setRemoved((current) => ({ ...current, [name]: true }));
    update(`${name}Url`, "");
  };

  const postVideoChunks = async (file, chunkSize) => {
    const uploadId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const totalChunks = Math.ceil(file.size / chunkSize);

    try {
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        const fd = new FormData();

        fd.append("uploadId", uploadId);
        fd.append("chunkIndex", String(chunkIndex));
        fd.append("totalChunks", String(totalChunks));
        fd.append("filename", file.name);
        fd.append("chunk", chunk, file.name);

        await api.post("/admin/uploads/videos/chunks", fd, {
          onUploadProgress: (event) => {
            const loadedInChunk = event.total ? event.loaded / event.total : 0;
            const uploadedRatio = (chunkIndex + loadedInChunk) / totalChunks;
            setProgress(Math.max(1, Math.min(95, Math.round(uploadedRatio * 95))));
          }
        });
      }

      setProgress(97);
      const { data } = await api.post("/admin/uploads/videos/complete", {
        uploadId,
        totalChunks,
        filename: file.name
      });
      setProgress(99);
      return data.videoUrl;
    } catch (error) {
      await api.delete(`/admin/uploads/videos/${uploadId}`).catch(() => {});
      throw error;
    }
  };

  const uploadVideoInChunks = async (file) => {
    let chunkSize = initialVideoChunkSize;

    while (chunkSize >= minVideoChunkSize) {
      try {
        return await postVideoChunks(file, chunkSize);
      } catch (error) {
        if (error.response?.status !== 413 || chunkSize <= minVideoChunkSize) throw error;
        chunkSize = Math.max(minVideoChunkSize, Math.floor(chunkSize / 2));
        setProgress(0);
        setMessage(`Server rejected the chunk size. Retrying video upload with ${formatBytes(chunkSize)} chunks.`);
      }
    }

    throw new Error("Video upload failed because the server rejected even the smallest chunk size.");
  };

  const submit = async (event) => {
    event.preventDefault();
    const intent = event.nativeEvent.submitter?.value || saveStatus;
    setLoading(true);
    setError("");
    setMessage("");
    setProgress(0);

    try {
      if (!form.genreId) {
        setError("Choose a genre so public users can find this movie in the correct category.");
        setLoading(false);
        return;
      }
      if (intent !== "draft" && !files.video && !form.videoUrl) {
        setError("Upload a movie video file before publishing so users can watch it.");
        setLoading(false);
        return;
      }

      let uploadedVideoUrl = form.videoUrl;
      if (files.video) {
        uploadedVideoUrl = await uploadVideoInChunks(files.video);
      }

      const fd = new FormData();
      const selectedGenre = genres.find((genre) => genre._id === form.genreId);
      const payload = {
        ...form,
        videoUrl: uploadedVideoUrl,
        status: intent,
        genre: selectedGenre?.name || form.genre,
        genres: form.genreId,
        description: form.fullDescription || form.shortDescription,
        maturityLevel: form.ageRating,
        rating: form.imdbRating
      };

      Object.entries(payload).forEach(([key, value]) => {
        if (!["posterUrl", "bannerUrl", "thumbnailUrl"].includes(key) && value !== undefined && value !== null) {
          fd.append(key, value);
        }
      });
      Object.entries(files).forEach(([key, file]) => key !== "video" && file && fd.append(key, file));
      Object.entries(removed).forEach(([key, value]) => value && fd.append(`remove${key}`, "true"));

      const config = {
        onUploadProgress: (event) => {
          if (!event.total) return;
          setProgress(Math.round((event.loaded * 100) / event.total));
        }
      };

      if (editing) await api.put(`/admin/movies/${id}`, fd, config);
      else await api.post("/admin/movies", fd, config);
      setProgress(100);

      setMessage(intent === "draft" ? "Movie saved as draft." : "Movie saved successfully.");
      setTimeout(() => navigate("/admin/movies"), 500);
    } catch (err) {
      if (err.response?.status === 413) {
        setError("The server still rejects the upload chunks. Set CHUNK_UPLOAD_MB=1 on the API server and allow at least 1MB request bodies in the proxy.");
      } else {
        setError(err.response?.data?.message || "Movie could not be saved. Check the form and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const mediaProgress = progress || 0;
  const posterPreview = files.poster ? URL.createObjectURL(files.poster) : toMediaUrl(form.posterUrl);
  const bannerPreview = files.banner ? URL.createObjectURL(files.banner) : toMediaUrl(form.bannerUrl);
  const videoPreview = files.video ? URL.createObjectURL(files.video) : toMediaUrl(form.videoUrl);

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/admin/movies" className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white">
              <ArrowLeft size={16} />
              Back to all movies
            </Link>
            <h2 className="text-3xl font-black">{editing ? "Edit Movie" : "Add Movie"}</h2>
            <p className="mt-1 text-zinc-400">Follow each section from top to bottom. The preview updates while you work.</p>
          </div>
          {(message || error) && (
            <div className={`rounded-lg px-4 py-3 text-sm font-semibold ${error ? "bg-red-950 text-red-100" : "bg-emerald-950 text-emerald-100"}`}>
              {error || message}
            </div>
          )}
        </div>

        <Section number="1" title="Basic Information">
          <div className="grid gap-4 md:grid-cols-2">
            <Label label="Movie Title">
              <input className={fieldClass} value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Example: Midnight Wave" required />
            </Label>
            <Label label="Genre">
              <select className={fieldClass} value={form.genreId} onChange={(event) => update("genreId", event.target.value)} required>
                <option value="">Select a genre</option>
                {genres.map((genre) => (
                  <option key={genre._id} value={genre._id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </Label>
            <Label label="Short Description" hint="A quick summary for cards and tables.">
              <textarea className={`${fieldClass} min-h-24`} value={form.shortDescription} onChange={(event) => update("shortDescription", event.target.value)} required />
            </Label>
            <Label label="Full Description" hint="Longer description shown on detail pages.">
              <textarea className={`${fieldClass} min-h-32`} value={form.fullDescription} onChange={(event) => update("fullDescription", event.target.value)} required />
            </Label>
            <Label label="Release Year">
              <input className={fieldClass} type="number" min="1900" max={currentYear + 5} value={form.releaseYear} onChange={(event) => update("releaseYear", event.target.value)} required />
            </Label>
            <Label label="Duration">
              <input className={fieldClass} type="number" min="1" value={form.duration} onChange={(event) => update("duration", event.target.value)} placeholder="Minutes" />
            </Label>
            <Label label="Language">
              <input className={fieldClass} value={form.language} onChange={(event) => update("language", event.target.value)} />
            </Label>
            <Label label="Country">
              <input className={fieldClass} value={form.country} onChange={(event) => update("country", event.target.value)} placeholder="United States" />
            </Label>
            <Label label="Age Rating">
              <select className={fieldClass} value={form.ageRating} onChange={(event) => update("ageRating", event.target.value)}>
                {["G", "PG", "PG-13", "13+", "16+", "18+", "R", "TV-MA"].map((rating) => (
                  <option key={rating}>{rating}</option>
                ))}
              </select>
            </Label>
            <div className="grid content-end gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold">
                <input type="checkbox" checked={form.featured} onChange={(event) => update("featured", event.target.checked)} />
                Featured
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold">
                <input type="checkbox" checked={form.trending} onChange={(event) => update("trending", event.target.checked)} />
                Trending
              </label>
            </div>
          </div>
        </Section>

        <Section number="2" title="Image Uploads">
          <div className="grid gap-4">
            <UploadDropzone name="poster" title="Poster Image" description="Use a vertical JPG, PNG, or WebP poster." accept={imageAccept} file={files.poster} existingUrl={form.posterUrl} progress={mediaProgress} onPick={pickFile} onRemove={removeFile} />
            <UploadDropzone name="banner" title="Banner Image" description="Use a wide image for hero and detail pages." accept={imageAccept} file={files.banner} existingUrl={form.bannerUrl} progress={mediaProgress} onPick={pickFile} onRemove={removeFile} />
            <UploadDropzone name="thumbnail" title="Thumbnail" description="Use a compact thumbnail for grids and recommendations." accept={imageAccept} file={files.thumbnail} existingUrl={form.thumbnailUrl} progress={mediaProgress} onPick={pickFile} onRemove={removeFile} />
          </div>
        </Section>

        <Section number="3" title="Video File Upload">
          <UploadDropzone
            name="video"
            title="Click or Drag Movie File Here"
            description="Accepted formats: MP4, WebM, or MOV. The file is stored locally in uploads/movies."
            accept={videoAccept}
            file={files.video}
            existingUrl={form.videoUrl}
            progress={mediaProgress}
            onPick={pickFile}
            onRemove={removeFile}
            video
          />
        </Section>

        <Section number="4" title="Cast and Extra Details">
          <div className="grid gap-4 md:grid-cols-2">
            <Label label="Cast Names" hint="Separate names with commas.">
              <textarea className={`${fieldClass} min-h-24`} value={form.cast} onChange={(event) => update("cast", event.target.value)} placeholder="Actor One, Actor Two" />
            </Label>
            <Label label="Director">
              <input className={fieldClass} value={form.director} onChange={(event) => update("director", event.target.value)} />
            </Label>
            <Label label="Writer">
              <input className={fieldClass} value={form.writer} onChange={(event) => update("writer", event.target.value)} />
            </Label>
            <Label label="Production Company">
              <input className={fieldClass} value={form.productionCompany} onChange={(event) => update("productionCompany", event.target.value)} />
            </Label>
            <Label label="IMDb Rating">
              <input className={fieldClass} type="number" min="0" max="10" step="0.1" value={form.imdbRating} onChange={(event) => update("imdbRating", event.target.value)} />
            </Label>
          </div>
        </Section>

        <Section number="5" title="Final Preview">
          <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
            <div className="relative h-56 bg-white/5">
              {bannerPreview ? <img src={bannerPreview} className="h-full w-full object-cover opacity-70" alt="" /> : <div className="grid h-full place-items-center text-zinc-500">Banner preview</div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-end gap-4">
                <div className="h-32 w-24 overflow-hidden rounded-lg bg-white/10">
                  {posterPreview ? <img src={posterPreview} className="h-full w-full object-cover" alt="" /> : null}
                </div>
                <div>
                  <h3 className="text-2xl font-black">{form.title || "Movie title"}</h3>
                  <p className="mt-1 text-sm text-zinc-300">{form.releaseYear} • {form.ageRating} • {form.duration || 0} min</p>
                  <p className="mt-2 max-w-2xl text-sm text-zinc-300">{form.shortDescription || "Short description appears here."}</p>
                </div>
              </div>
            </div>
            {videoPreview && <video src={videoPreview} className="max-h-72 w-full bg-black" controls />}
          </div>
        </Section>

        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" disabled={loading} value="published" onClick={() => setSaveStatus("published")}>
            {loading && saveStatus === "published" ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Movie
          </button>
          <button type="submit" className="btn-muted" disabled={loading} value="draft" onClick={() => setSaveStatus("draft")}>
            <BadgeCheck size={18} />
            Save as Draft
          </button>
          <Link to="/admin/movies" className="btn-muted">
            <X size={18} />
            Cancel
          </Link>
        </div>
      </div>

      <aside className="h-fit rounded-lg border border-white/10 bg-wave-panel p-5 xl:sticky xl:top-28">
        <h2 className="text-lg font-black">Live Preview</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-black">
          <div className="aspect-[2/3] bg-white/5">
            {posterPreview ? <img src={posterPreview} className="h-full w-full object-cover" alt="" /> : <div className="grid h-full place-items-center text-zinc-500">Poster</div>}
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-wave-red">
              <CheckCircle2 size={14} />
              {saveStatus === "draft" ? "Draft" : "Ready to publish"}
            </div>
            <h3 className="mt-2 text-xl font-black">{form.title || "Untitled movie"}</h3>
            <p className="mt-1 text-sm text-zinc-400">{genres.find((genre) => genre._id === form.genreId)?.name || form.genre || "Genre"} • {form.releaseYear}</p>
            <p className="mt-3 line-clamp-4 text-sm text-zinc-300">{form.shortDescription || "Add a short description to make the card easy to understand."}</p>
          </div>
        </div>
        {progress > 0 && (
          <div className="mt-4 rounded-lg bg-white/5 p-3">
            <div className="mb-2 flex justify-between text-sm">
              <span>Upload progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-wave-red" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </aside>
    </form>
  );
};

export default AdminMovieForm;
