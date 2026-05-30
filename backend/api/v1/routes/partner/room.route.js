const express = require("express");
const router = express.Router();

const controller = require("../../controllers/partner/room.controller");

router.get("/", controller.index);
router.post("/create", controller.create);
router.put("/edit/:id_room", controller.edit);
router.put("/change-status/:id_room", controller.changeStatus);



module.exports = router;
