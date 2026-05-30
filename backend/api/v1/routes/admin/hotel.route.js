const express = require("express");

const router = express.Router();

const controller = require("../../controllers/admin/hotel.controller");
router.get("/", controller.index);
router.put("/operation/:id_hotel", controller.operation);




module.exports = router;