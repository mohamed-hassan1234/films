const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const { uploadFolders } = require("../middleware/uploadMiddleware");

const fileUrl = (req, file) => {
  if (!file) return undefined;
  const folder = uploadFolders[file.fieldname] || (file.mimetype.startsWith("video/") ? "movies" : "images");
  return `${req.protocol}://${req.get("host")}/uploads/${folder}/${file.filename}`;
};

const pickUploadUrls = (req) => {
  const files = req.files || {};
  return {
    poster: fileUrl(req, files.poster?.[0]),
    banner: fileUrl(req, files.banner?.[0]),
    thumbnail: fileUrl(req, files.thumbnail?.[0]),
    posterUrl: fileUrl(req, files.poster?.[0]),
    bannerUrl: fileUrl(req, files.banner?.[0]),
    thumbnailUrl: fileUrl(req, files.thumbnail?.[0]),
    videoUrl: fileUrl(req, files.video?.[0])
  };
};

const compact = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined && value !== ""));

module.exports = { toArray, pickUploadUrls, compact };
