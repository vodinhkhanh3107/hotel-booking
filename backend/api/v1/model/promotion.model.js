const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    id_partner: {
        type: String
    },
    for_hotels: {
        type: Array,
        default: []        
    },
    code: {
        type: String,
        required: true,
        trim: true
    },
    discount_percent: {
        type: Number,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'expired'],
        default: 'available'
    },
    note: {
        type: String
    },
    blocked: {
        type: Boolean,
        default: false
    }
    
});

const Promotion = mongoose.model("promotions",promotionSchema);
module.exports = Promotion;