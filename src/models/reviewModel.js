const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  bookingId: {
    type: String,
    required: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "provider",
  },
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
  },
});

// Static method to calculate average rating for a provider
ratingSchema.statics.calculateAverageRating = async function (providerId) {
  const stats = await this.aggregate([
    {
      $match: { provider: providerId },
    },
    {
      $group: {
        _id: "$provider",
        totalRating: { $sum: "$rating" },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await this.model("provider").findByIdAndUpdate(providerId, {
      totalRating: stats[0].totalRating,
      avgRating: stats[0].avgRating,
    });
  } else {
    await this.model("provider").findByIdAndUpdate(providerId, {
      totalRating: 0,
      avgRating: 0,
    });
  }
};

// Middleware to calculate average rating after saving a new rating
ratingSchema.post("save", function () {
  this.constructor.calculateAverageRating(this.provider);
});

// Middleware to calculate average rating before removing a rating
ratingSchema.pre("remove", function () {
  this.constructor.calculateAverageRating(this.provider);
});

const Rating = mongoose.model("rating", ratingSchema);

module.exports = Rating;
