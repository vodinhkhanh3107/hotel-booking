const express = require("express");
const router = express.Router();

const controller = require("../../controllers/partner/model-hotel.controller");

router.get("/", controller.index);



module.exports = router;
