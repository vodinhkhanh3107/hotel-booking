const mongoose = require("mongoose");

const revenueReportSchema = new mongoose.Schema({
    code_order: {
        type: String,
    },
    id_hotel: {
        type: String
    },
    transaction_date: {
        type: Date,
    },
    total_amount: {
        type: Number
    },
    percent_permission: {
        type: Number
    },
    revenue_admin: {
        type: Number,
    },
    revenue_partner: {
        type: Number,
    }
});

const RevenueReport = mongoose.model("revenue-reports",revenueReportSchema);
module.exports = RevenueReport
