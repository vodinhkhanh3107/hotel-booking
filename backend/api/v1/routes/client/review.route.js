const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/review.controller");

router.get("/hotel/:id_hotel", controller.getReviewOfHotel);
router.post("/create", controller.create);



module.exports = router;

