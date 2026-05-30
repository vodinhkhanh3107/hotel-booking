const express = require("express");
const router = express.Router();

const controller = require("../../controllers/partner/model-room.controller");

router.get("/", controller.index);
router.post("/create", controller.create);
router.put("/edit/:id_room_type", controller.update);
router.put("/change-status/:id_room_type", controller.updateStatus);


module.exports = router;
