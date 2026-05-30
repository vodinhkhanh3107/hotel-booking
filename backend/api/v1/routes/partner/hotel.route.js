const express = require("express");
const router = express.Router();

const controller = require("../../controllers/partner/hotel.controller");

router.get("/", controller.index);
router.post("/create", controller.create);
router.post("/operation", controller.operation);
router.put("/update/:id_hotel", controller.update);
router.put("/change-status/:id_hotel", controller.changeStatusHotel);
router.put("/re-approved/:id_hotel", controller.reApproved);



module.exports = router;
