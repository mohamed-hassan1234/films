const express = require("express");
const { saveProgress, continueWatching } = require("../controllers/historyController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);
router.post("/progress", saveProgress);
router.get("/continue-watching", continueWatching);

module.exports = router;
