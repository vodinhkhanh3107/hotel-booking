const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    id_order: {
        type: String
    },
    id_user: {
        type: String
    },
    id_hotel: {
        type: String
    },
    id_room: {
        type: String
    },
    rating: {
        type: Number
    },
    comment: {
        type: String,
    }
},
{
    timeseries: true
});


const Review = mongoose.model("reviews",reviewSchema);
module.exports = Review;