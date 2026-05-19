const express = require("express");
const { stats, users, updateUser, deleteUser, reports } = require("../controllers/adminController");
const { getMovies, getMovieById, createMovie, updateMovie, deleteMovie } = require("../controllers/movieController");
const { saveVideoChunk, completeVideoUpload, cancelVideoUpload } = require("../controllers/uploadController");
const { protect, admin } = require("../middleware/authMiddleware");
const { uploadFields, uploadRequestTimeout, uploadChunk } = require("../middleware/uploadMiddleware");

const router = express.Router();
router.use(protect, admin);
router.get("/stats", stats);
router.post("/uploads/videos/chunks", uploadRequestTimeout, uploadChunk, saveVideoChunk);
router.post("/uploads/videos/complete", uploadRequestTimeout, completeVideoUpload);
router.delete("/uploads/videos/:uploadId", cancelVideoUpload);
router.get("/movies", getMovies);
router.post("/movies", uploadRequestTimeout, uploadFields, createMovie);
router.get("/movies/:id", getMovieById);
router.put("/movies/:id", uploadRequestTimeout, uploadFields, updateMovie);
router.delete("/movies/:id", deleteMovie);
router.get("/users", users);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/reports", reports);

module.exports = router;
