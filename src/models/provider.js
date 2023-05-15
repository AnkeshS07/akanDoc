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
      required:true,
    },
    countryCode:{
type:String,
required:true
    },

    isVerified:{
      type:Boolean,
      default:false
    },
    licensed:{
        type:Boolean,
        required:true
      },
    qualification:[{
      type:String,
      default:null
    }],
    specialization:[{
      type:String,
      default:null
    }],
     location:{
      type:String,
      default:null
    },
     bio:{
      type:String,
      default:null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("provider", ProviderSchema);
