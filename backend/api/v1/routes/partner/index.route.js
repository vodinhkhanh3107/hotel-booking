
const authRoute = require("./auth.route");
const hotelRoute = require("./hotel.route");
const accountRoute = require("./account.route");
const modelRoomRoute = require("./model-room.route");
const roomRoute = require("./room.route");
const promotionRoute = require("./promotion.route");
const revenueReportRoute = require("./revenue-report.route");
const orderRoute = require("./order.route");
const ModelHotelRoute = require("./model-hotel.route");
const AmenityRoute = require("./amenity.route");

const apiVersion = require("../../../../config/constant");

const PRE_PARTNER = "partner";

module.exports = (app) => {
    app.use(`${apiVersion.v1}/${PRE_PARTNER}` + "/auth", authRoute);
    app.use(`${apiVersion.v1}/${PRE_PARTNER}` + "/hotel", hotelRoute);
    app.use(`${apiVersion.v1}/${PRE_PARTNER}` + "/account", accountRoute);
    app.use(`${apiVersion.v1}/${PRE_PARTNER}` + "/model-room", modelRoomRoute);
    app.use(`${apiVersion.v1}/${PRE_PARTNER}` + "/room", roomRoute);
    app.use(`${apiVersion.v1}/${PRE_PARTNER}` + "/promotion", promotionRoute);
    app.use(`${apiVersion.v1}/${PRE_PARTNER}` + "/revenue-report", revenueReportRoute);
    app.use(`${apiVersion.v1}/${PRE_PARTNER}` + "/order", orderRoute);
    app.use(`${apiVersion.v1}/${PRE_PARTNER}` + "/model-hotel", ModelHotelRoute);
    app.use(`${apiVersion.v1}/${PRE_PARTNER}` + "/amenity", AmenityRoute);

}
