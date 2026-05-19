const express = require("express");
const { getMovies, getMovieById, createMovie, updateMovie, deleteMovie } = require("../controllers/movieController");
const { protect, admin } = require("../middleware/authMiddleware");
const { uploadFields } = require("../middleware/uploadMiddleware");

const router = express.Router();
router.get("/", getMovies);
router.get("/:id", getMovieById);
router.post("/admin", protect, admin, uploadFields, createMovie);
router.put("/admin/:id", protect, admin, uploadFields, updateMovie);
router.delete("/admin/:id", protect, admin, deleteMovie);

module.exports = router;
