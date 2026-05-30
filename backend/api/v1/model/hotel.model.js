const slug = require("mongoose-slug-updater");
const mongoose = require("mongoose");
mongoose.plugin(slug);

const hotelSchema = new mongoose.Schema({
  id_partner: {
    type: String,
    require: true
  },
  id_model_hotel: {
    type: String,
  },
  hotel_name: {
    type: String,
    required: true,
    trim: true,
  },
  hotel_address: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  star_level: {
    type: Number,
    min: 0,
    max: 5,
  },

  thumbnail: {
    type: String,
  },
  status: {
    type: String,
    default: "PENDING",
    enum: ["PENDING", "APPROVED", "REJECTED"],
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  percent_permission: {
    type: Number,
    default: 0,
  },
  slug: {
    type: String,
    slug: "hotel_address",
    unique: true,
  },
},
  {
    timestamps: true
  }
);

const Hotel = mongoose.model("hotels", hotelSchema);
module.exports = Hotel;
