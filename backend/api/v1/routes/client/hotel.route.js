const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/hotel.controller");

router.get("/", controller.index);
router.get("/search", controller.search);
router.get("/detail/:id_hotel", controller.detail);
router.get("/model-hotel/:slug", controller.searchByModelHotel);
router.get("/location/:slug", controller.searchByLocation);
router.get("/sale", controller.sale);






module.exports = router;

