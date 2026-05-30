const slug = require('mongoose-slug-updater');
const mongoose = require("mongoose");
mongoose.plugin(slug);


const modelHotelSchema = new mongoose.Schema({
    model_hotel: {
        type: String
    },
    description: {
        type: String
    },
    slug: {
        type: String,
        slug: "model_hotel"
    },
    thumbnail: {
        type: String,
    }
},
    {
        timestamps: true
    });

const ModelHotel = mongoose.model("model-hotels",modelHotelSchema);
module.exports = ModelHotel