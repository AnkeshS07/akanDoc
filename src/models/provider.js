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
   type:String
    },

    isVerified:{
      type:Boolean,
      default:false
    },
    licensed:{
        type:Boolean,
        default:false
      },
    qualification:{
      type:String,
      enum: ["mbbs", "phd", "pgi",null],
      default:null,
      required:false
    },
    specialization: {
      type: String,
      enum: ["Specialization1", "Specialization2", "Specialization3",null],
      default: null,
      required:false

    },
    location: {
        type: {
          type: String,
          enum: ["Point"],
          required: true,
        },
        coordinates: {
          type: [Number],
          required: true,
        }
      },
     bio:{
      type:String,
      default:null
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

module.exports = mongoose.model("provider", ProviderSchema);
