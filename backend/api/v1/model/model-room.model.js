const mongoose = require('mongoose');

const modelRoomSchema = new mongoose.Schema({
    id_partner: {
        type: String
    },
    type_room: {
        type: String,
        require: true
    },
    description: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["active","block"],
        default: "active"
    },
});

const ModelRoom = mongoose.model('model-rooms', modelRoomSchema);
module.exports = ModelRoom;