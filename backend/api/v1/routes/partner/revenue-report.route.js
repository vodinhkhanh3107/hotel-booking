const express = require("express");
const router = express.Router();

const controller = require("../../controllers/partner/revenue-report.controller");

router.get("/", controller.index);
router.get("/:id_hotel", controller.revenueByHotel);



module.exports = router;
