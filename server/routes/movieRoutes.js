const express = require("express");
const { getMovies, getMovieById, createMovie, updateMovie, deleteMovie } = require("../controllers/movieController");
const { protect, admin } = require("../middleware/authMiddleware");
const { uploadFields, uploadRequestTimeout } = require("../middleware/uploadMiddleware");

const router = express.Router();
router.get("/", getMovies);
router.get("/:id", getMovieById);
router.post("/admin", protect, admin, uploadRequestTimeout, uploadFields, createMovie);
router.put("/admin/:id", protect, admin, uploadRequestTimeout, uploadFields, updateMovie);
router.delete("/admin/:id", protect, admin, deleteMovie);

module.exports = router;
