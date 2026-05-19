const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();
app.set("trust proxy", 1);
const normalizeOrigin = (origin = "") => origin.trim().replace(/\/+$/, "");
const allowedOrigins = new Set(
  (process.env.CLIENT_URL || "https://flim.atmaengi.com")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean)
);

["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"].forEach((origin) =>
  allowedOrigins.add(origin)
);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(normalizeOrigin(origin))) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
};

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "10mb" }));
app.use(express.urlencoded({ extended: true, limit: process.env.FORM_BODY_LIMIT || "10mb" }));
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600,
    skip: (req) =>
      req.path.startsWith("/api/admin/uploads/videos") ||
      req.path.startsWith("/api/uploads") ||
      req.path.startsWith("/uploads")
  })
);
const uploadsPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath, { acceptRanges: true, maxAge: "7d" }));
app.use("/api/uploads", express.static(uploadsPath, { acceptRanges: true, maxAge: "7d" }));

const legacyUploadFolders = {
  "poster-": "posters",
  "banner-": "banners",
  "thumbnail-": "thumbnails",
  "video-": "movies"
};

app.get("/:filename", (req, res, next) => {
  const filename = path.basename(req.params.filename || "");
  const matchedPrefix = Object.keys(legacyUploadFolders).find((prefix) => filename.startsWith(prefix));
  if (!matchedPrefix) return next();
  return res.sendFile(path.join(__dirname, "uploads", legacyUploadFolders[matchedPrefix], filename), (error) => {
    if (error) next();
  });
});

app.get("/api/:filename", (req, res, next) => {
  const filename = path.basename(req.params.filename || "");
  const matchedPrefix = Object.keys(legacyUploadFolders).find((prefix) => filename.startsWith(prefix));
  if (!matchedPrefix) return next();
  return res.sendFile(path.join(uploadsPath, legacyUploadFolders[matchedPrefix], filename), (error) => {
    if (error) next();
  });
});

app.get("/api/health", (_req, res) => res.json({ status: "ok", app: "StreamWave API" }));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/profiles", require("./routes/profileRoutes"));
app.use("/api/movies", require("./routes/movieRoutes"));
app.use("/api/series", require("./routes/seriesRoutes"));
app.use("/api/genres", require("./routes/genreRoutes"));
app.use("/api/watchlist", require("./routes/watchlistRoutes"));
app.use("/api/history", require("./routes/historyRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`StreamWave API running on port ${PORT}`));
