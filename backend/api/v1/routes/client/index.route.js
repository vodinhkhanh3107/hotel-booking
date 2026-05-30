
const apiVersion = require("../../../../config/constant");
const accountRoute = require("./account.route");
const authRoute = require("./auth.route");
const hotelRoute = require("./hotel.route");
const orderRoute = require("./order.route");
const roomRoute = require("./room.route");
const reviewRoute = require("./review.route");
const modelHotelRoute = require("./model-hotel.route");

module.exports = (app) => {
    app.use(`${apiVersion.v1}` + "/account", accountRoute);
    app.use(`${apiVersion.v1}` + "/auth", authRoute);
    app.use(`${apiVersion.v1}` + "/hotel", hotelRoute);
    app.use(`${apiVersion.v1}` + "/order", orderRoute);
    app.use(`${apiVersion.v1}` + "/room", roomRoute);
    app.use(`${apiVersion.v1}` + "/review", reviewRoute);
    app.use(`${apiVersion.v1}` + "/model-hotel", modelHotelRoute);

}
