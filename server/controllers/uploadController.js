const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const asyncHandler = require("../middleware/asyncHandler");
const { uploadFolders } = require("../middleware/uploadMiddleware");

const uploadRoot = path.join(__dirname, "..", "uploads");
const tempRoot = path.join(uploadRoot, "tmp");
const movieRoot = path.join(uploadRoot, uploadFolders.video);
const videoExtensions = new Set([".mp4", ".webm", ".mov", ".m4v"]);

const ensureDir = async (dir) => {
  await fsp.mkdir(dir, { recursive: true });
};

const assertInside = (parent, target) => {
  const relative = path.relative(parent, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    const error = new Error("Invalid upload path");
    error.statusCode = 400;
    throw error;
  }
};

const safeUploadId = (uploadId = "") => {
  const value = String(uploadId);
  if (!/^[a-zA-Z0-9_-]{10,100}$/.test(value)) {
    const error = new Error("Invalid upload session");
    error.statusCode = 400;
    throw error;
  }
  return value;
};

const safeMovieName = (filename = "movie.mp4") => {
  const extension = path.extname(filename).toLowerCase();
  if (!videoExtensions.has(extension)) {
    const error = new Error("Only MP4, WebM, MOV, and M4V video uploads are allowed");
    error.statusCode = 400;
    throw error;
  }

  const baseName =
    path
      .basename(filename, extension)
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "movie";

  return `video-${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${extension}`;
};

const parseIndex = (value, name) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    const error = new Error(`Invalid ${name}`);
    error.statusCode = 400;
    throw error;
  }
  return number;
};

const chunkPath = (uploadId, index) => path.join(tempRoot, uploadId, `${String(index).padStart(8, "0")}.part`);

const saveVideoChunk = asyncHandler(async (req, res) => {
  if (!req.file?.buffer?.length) {
    res.status(400);
    throw new Error("Upload chunk is required");
  }

  const uploadId = safeUploadId(req.body.uploadId);
  const chunkIndex = parseIndex(req.body.chunkIndex, "chunk index");
  const totalChunks = parseIndex(req.body.totalChunks, "chunk count");

  if (totalChunks < 1 || chunkIndex >= totalChunks) {
    res.status(400);
    throw new Error("Invalid chunk position");
  }

  const dir = path.join(tempRoot, uploadId);
  assertInside(tempRoot, dir);
  await ensureDir(dir);

  const target = chunkPath(uploadId, chunkIndex);
  assertInside(dir, target);
  await fsp.writeFile(target, req.file.buffer);

  res.status(201).json({ uploadId, chunkIndex, totalChunks });
});

const completeVideoUpload = asyncHandler(async (req, res) => {
  const uploadId = safeUploadId(req.body.uploadId);
  const totalChunks = parseIndex(req.body.totalChunks, "chunk count");
  const finalName = safeMovieName(req.body.filename);

  if (totalChunks < 1) {
    res.status(400);
    throw new Error("Invalid chunk count");
  }

  const dir = path.join(tempRoot, uploadId);
  assertInside(tempRoot, dir);
  await ensureDir(movieRoot);

  for (let index = 0; index < totalChunks; index += 1) {
    const part = chunkPath(uploadId, index);
    assertInside(dir, part);
    if (!fs.existsSync(part)) {
      res.status(400);
      throw new Error(`Missing video chunk ${index + 1} of ${totalChunks}`);
    }
  }

  const finalPath = path.join(movieRoot, finalName);
  assertInside(movieRoot, finalPath);

  const output = fs.createWriteStream(finalPath);
  try {
    for (let index = 0; index < totalChunks; index += 1) {
      const part = chunkPath(uploadId, index);
      await new Promise((resolve, reject) => {
        const input = fs.createReadStream(part);
        input.on("error", reject);
        output.on("error", reject);
        input.on("end", resolve);
        input.pipe(output, { end: false });
      });
    }
  } catch (error) {
    output.destroy();
    throw error;
  }

  await new Promise((resolve, reject) => {
    output.end((error) => (error ? reject(error) : resolve()));
  });

  await fsp.rm(dir, { recursive: true, force: true });

  const videoUrl = `${req.protocol}://${req.get("host")}/uploads/${uploadFolders.video}/${finalName}`;
  res.json({ videoUrl });
});

const cancelVideoUpload = asyncHandler(async (req, res) => {
  const uploadId = safeUploadId(req.params.uploadId);
  const dir = path.join(tempRoot, uploadId);
  assertInside(tempRoot, dir);
  await fsp.rm(dir, { recursive: true, force: true });
  res.json({ message: "Upload cancelled" });
});

module.exports = { saveVideoChunk, completeVideoUpload, cancelVideoUpload };
