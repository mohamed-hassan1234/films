const express = require("express");
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require("../controllers/watchlistController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);
router.get("/", getWatchlist);
router.post("/:contentId", addToWatchlist);
router.delete("/:contentId", removeFromWatchlist);

module.exports = router;
