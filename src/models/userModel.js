const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
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
    name: {
      type: String,
    },

    otp: {
      type: Number,
      default: -1,
      expires: "2m",
    },
    countryCode:{
      type:String,
      required:true
    },
    phone: {
      type: String
    },

    isVerified:{
      type:Boolean,
      default:false
    },
    device_info:[{
      device_id: { //header
        type: String,
        require:true
      },
      device_token : {
        type: String,
       default:null
      },
      jwt_token: {
        type: String,
        default:null
      },
      device_type:{
        type:String,
        default:null
      }
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
