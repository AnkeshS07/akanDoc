const mongoose = require("mongoose");
const ProviderSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      validate: {
        validator: function (value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: true,
      unique: false,
    },
    confirmPassword: {
      type: String,
      default: null,
    },
    userProfile: {
      type: String,
      default: null,
    },
    userDoc: {
      type: String,
      default: null,
    },

    name: {
      type: String,
    },
    otp: {
      type: Number,
      default: -1,
      expires: "2m",
    },
    phone: {
      type: String,
      required: true,
    },
    countryCode: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    licensed: {
      type: Boolean,
      default: true,
    },
    qualification: {
      type: Object,
      required: false,
      default: null,
    },
    skills: {
      type: Object,
      required: false,
      default: [], 
    },
    specialization: {
      type: Object,
      required: false,
      default: null,
    },
    totalBalance: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
   
    location: {
      name: {
        type: String,
        default: "",
      },
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
        index: "2dsphere", // Add this line to create a 2dsphere index
      },
    },
    bio: {
      type: String,
      default: null,
    },
    reviews: {
      type: Object,
      default: null,
    },

    device_info: [
      {
        device_id: {
          //header
          type: String,
          require: true,
        },
        device_token: {
          type: String,
          default: null,
        },
        jwt_token: {
          type: String,
          default: null,
        },
        device_type: {
          type: String,
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);
ProviderSchema.index({ location: "2dsphere" });
ProviderSchema.set("toObject", { virtuals: true });
ProviderSchema.set("toJSON", { virtuals: true });
ProviderSchema.virtual("imageUrl").get(function () {
  if (this.userProfile) {
    const baseUrl = process.env.BASE_URL.replace(/"/g, "");
    return `${baseUrl}/uploads/${this.userProfile}`;
  } else {
    return "";
  }
});
ProviderSchema.statics.paginate = async function (query, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const totalCount = await this.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);

  const results = await this.find(query).skip(skip).limit(limit);

  return {
    page,
    limit,
    total: totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    data: results,
  };
};

module.exports = mongoose.model("provider", ProviderSchema);
