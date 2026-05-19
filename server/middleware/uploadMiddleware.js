const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadRoot = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });
const configuredMaxUploadMb = Number(process.env.MAX_UPLOAD_MB || 27000);
const maxUploadMb = Number.isFinite(configuredMaxUploadMb) && configuredMaxUploadMb > 0 ? configuredMaxUploadMb : 27000;
const configuredUploadTimeoutMs = Number(process.env.UPLOAD_TIMEOUT_MS || 30 * 60 * 1000);
const uploadTimeoutMs =
  Number.isFinite(configuredUploadTimeoutMs) && configuredUploadTimeoutMs > 0 ? configuredUploadTimeoutMs : 30 * 60 * 1000;
const configuredChunkUploadMb = Number(process.env.CHUNK_UPLOAD_MB || 1);
const chunkUploadMb = Number.isFinite(configuredChunkUploadMb) && configuredChunkUploadMb > 0 ? configuredChunkUploadMb : 1;

const uploadFolders = {
  poster: "posters",
  banner: "banners",
  thumbnail: "thumbnails",
  video: "movies"
};

Object.values(uploadFolders).forEach((folder) => {
  const target = path.join(uploadRoot, folder);
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const folder = uploadFolders[file.fieldname] || (file.mimetype.startsWith("video/") ? "movies" : "images");
    const target = path.join(uploadRoot, folder);
    if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
    cb(null, target);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();
    cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${extension}`);
  }
});

const fileFilter = (_req, file, cb) => {
  const imageTypes = ["image/jpeg", "image/png", "image/webp"];
  const videoTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"];
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const videoExtensions = [".mp4", ".webm", ".mov", ".m4v"];
  const extension = path.extname(file.originalname).toLowerCase();
  const allowed =
    file.fieldname === "video"
      ? videoTypes.includes(file.mimetype) || videoExtensions.includes(extension)
      : imageTypes.includes(file.mimetype) || imageExtensions.includes(extension);

  if (!allowed) {
    const error = new Error("Only JPG, PNG, WebP, MP4, WebM, MOV, and M4V uploads are allowed");
    error.statusCode = 400;
    return cb(error, false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * maxUploadMb }
});

const uploadChunk = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * chunkUploadMb }
}).single("chunk");

const uploadFields = upload.fields([
  { name: "poster", maxCount: 1 },
  { name: "banner", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
  { name: "video", maxCount: 1 }
]);

const uploadRequestTimeout = (req, res, next) => {
  req.setTimeout(uploadTimeoutMs);
  res.setTimeout(uploadTimeoutMs);
  next();
};

module.exports = { upload, uploadFields, uploadFolders, uploadRequestTimeout, uploadChunk, maxUploadMb, chunkUploadMb };
