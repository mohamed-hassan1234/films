const express = require("express");
const {
  getSeries,
  getSeriesById,
  createSeries,
  updateSeries,
  deleteSeries,
  addSeason,
  addEpisode
} = require("../controllers/seriesController");
const { protect, admin } = require("../middleware/authMiddleware");
const { uploadFields } = require("../middleware/uploadMiddleware");

const router = express.Router();
router.get("/", getSeries);
router.get("/:id", getSeriesById);
router.post("/admin", protect, admin, uploadFields, createSeries);
router.put("/admin/:id", protect, admin, uploadFields, updateSeries);
router.delete("/admin/:id", protect, admin, deleteSeries);
router.post("/admin/:id/seasons", protect, admin, addSeason);
router.post("/admin/:id/episodes", protect, admin, uploadFields, addEpisode);

module.exports = router;
