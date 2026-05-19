const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "contentType" },
    contentType: { type: String, enum: ["Movie", "Series"], required: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
    comment: { type: String, default: "", maxlength: 600 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
