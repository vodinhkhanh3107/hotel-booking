const mongoose = require("mongoose");

const amenitySchema = new mongoose.Schema({
  id_admin: {
    type: String
  },
  code_amentity: {
    type: String,
  },
  name_amenity: {
    type: String,
  },
  status: {
    type: String,
    enum: ["active","block"]
  }
});

const Amenity = mongoose.model("amenities", amenitySchema);
module.exports = Amenity;
