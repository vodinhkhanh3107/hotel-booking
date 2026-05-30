const mongoose = require('mongoose');

const orderRoomSchema = new mongoose.Schema({
    code_order: {
        type: String,
        require: true,
    },
    id_user: {
        type: String,
        required: true
    },
    id_hotel: {
        type: String,
        required: true
    },
    id_room: {
        type: String,
        required: true
    },
    check_in_date: {
        type: Date,
        required: true
    },
    check_out_date: {
        type: Date,
        required: true
    },
    total_amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED","CANCELLED","COMPLETED"],
        default: "PENDING"
    },
    id_promotion: {
        type: String,
    },
    note: {
        type: String,
    },
    nights: {
        type: Number
    },
    sub_total: {
        type: Number
    },
    tax: {
        type: Number
    }
},
    {
        timestamps: true
    });

const OrderRoom = mongoose.model('order-room', orderRoomSchema);
module.exports = OrderRoom;