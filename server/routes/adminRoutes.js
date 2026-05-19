const express = require("express");
const { stats, users, updateUser, deleteUser, reports } = require("../controllers/adminController");
const { getMovies, getMovieById, createMovie, updateMovie, deleteMovie } = require("../controllers/movieController");
const { protect, admin } = require("../middleware/authMiddleware");
const { uploadFields } = require("../middleware/uploadMiddleware");

const router = express.Router();
router.use(protect, admin);
router.get("/stats", stats);
router.get("/movies", getMovies);
router.post("/movies", uploadFields, createMovie);
router.get("/movies/:id", getMovieById);
router.put("/movies/:id", uploadFields, updateMovie);
router.delete("/movies/:id", deleteMovie);
router.get("/users", users);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/reports", reports);

module.exports = router;
