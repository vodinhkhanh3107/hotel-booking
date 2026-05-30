const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/model-hotel.controller");

router.get("/", controller.index);
router.get("/hotel", controller.getHotelByModel);


module.exports = router;

