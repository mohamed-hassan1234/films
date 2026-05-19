const mongoose = require("mongoose");

const seasonSchema = new mongoose.Schema(
  {
    series: { type: mongoose.Schema.Types.ObjectId, ref: "Series", required: true },
    seasonNumber: { type: Number, required: true },
    title: { type: String, default: "" }
  },
  { timestamps: true }
);

seasonSchema.index({ series: 1, seasonNumber: 1 }, { unique: true });

module.exports = mongoose.model("Season", seasonSchema);
