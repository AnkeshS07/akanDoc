const mongoose = require("mongoose");
const bookingRequestSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: function () {
        const randomDigits = Math.floor(Math.random() * 90000) + 10000;
        return `AKAND${randomDigits}`;
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: true,
    },
    specialization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "specializations",
      required: false,
    },
    healthComplaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "skill",
      required: false,
    },
    description: {
      type: String,
    },
    review: {
      type: Object,
      default: null,
    },
    status: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6],
      default: 0,
    },
    selectedDateTime: {
      type: String,
      required: true,
    },
    bookingTime: {
      type: String,
      required: false,
      default: null,
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    latitude: {
      type: Number,
      default: 0,
    },
    longitude: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
      default: "",
    },
    distance: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 100,
    },
    isForward: {
      type: Number,
      default: 0,
    },
    forwardedTo: [
      {
        type: Object,
      },
    ],
    assignTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
    },
  },
  { timestamps: true }
);

const bookingRequest = mongoose.model("bookingRequest", bookingRequestSchema);
module.exports = bookingRequest;
