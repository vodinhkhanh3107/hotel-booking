const express = require("express");
const router = express.Router();

const controller = require("../../controllers/partner/order.controller");

router.get("/", controller.index);
// router.get("/status", controller.type);



module.exports = router;
