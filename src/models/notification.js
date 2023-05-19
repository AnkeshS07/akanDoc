const mongoose = require("mongoose");

const bookingRequestSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
     
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'provider',
      required:true,

    },
    healthComplaint:{
        type:String,
        required:true
    },
    specialist:{
        type:Boolean,
        required:true
    },
    description:{
        type:String
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    selectedDateTime: {
        type: Date,
        required: true,
      }
  });
module.exports = mongoose.model('BookingRequest', bookingRequestSchema);
  
