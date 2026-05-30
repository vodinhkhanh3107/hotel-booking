
const apiVersion = require("../../../../config/constant");
const accountRoute = require("./account.route");
const authRoute = require("./auth.route");
const modelHotelRoute = require("./model-hotel.route");
const amenityRoute = require("./amenity.route");
const hotelRoute = require("./hotel.route");
const revenueReportRoute = require("./revenue-report.route");
const dashboardRoute = require("./dashboard.route");


const PRE_ADMIN = "admin";

module.exports = (app) => {
    app.use(`${apiVersion.v1}/${PRE_ADMIN}` + "/account", accountRoute);
    app.use(`${apiVersion.v1}/${PRE_ADMIN}` + "/auth", authRoute);
    app.use(`${apiVersion.v1}/${PRE_ADMIN}` + "/model-hotel", modelHotelRoute);
    app.use(`${apiVersion.v1}/${PRE_ADMIN}` + "/amenity", amenityRoute);
    app.use(`${apiVersion.v1}/${PRE_ADMIN}` + "/hotel", hotelRoute);
    app.use(`${apiVersion.v1}/${PRE_ADMIN}` + "/revenue-report", revenueReportRoute);
    app.use(`${apiVersion.v1}/${PRE_ADMIN}` + "/dashboard", dashboardRoute);

}
