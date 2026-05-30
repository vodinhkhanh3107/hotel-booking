const express = require("express");

const router = express.Router();

const controller = require("../../controllers/admin/dashboard.controller");

router.get("/", controller.index);
router.get("/top-hotel-revenue", controller.topHotel);
router.get("/revenue-of-year", controller.revenueOfYear);







module.exports = router;