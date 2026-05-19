const express = require("express");
const { getGenres, createGenre, updateGenre, deleteGenre } = require("../controllers/genreController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/", getGenres);
router.post("/admin", protect, admin, createGenre);
router.put("/admin/:id", protect, admin, updateGenre);
router.delete("/admin/:id", protect, admin, deleteGenre);

module.exports = router;
