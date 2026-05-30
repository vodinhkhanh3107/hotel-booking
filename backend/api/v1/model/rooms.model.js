const mogoose = require('mongoose');

const roomSchema = new mogoose.Schema({
    id_hotel: {
        type: String,
        require: true
    },
    number_room: {
        type: String,
    },
    id_room_type: {
        type: String,
        require: true
    },
    capacity: {
        type: Number
    },
    price: {
        type: Number,
        require: true
    },
    status: {
        type: String,
        enum: ["active","inactive"],
        default: "inactive"
    },
    blocked: {
        type: Boolean,
        default: false
    },
    thumbnail: {
        type: String
    },
    id_amenities: {
        type: Array,
        default: []
    }

});

const Room = mogoose.model('rooms', roomSchema);

module.exports = Room;