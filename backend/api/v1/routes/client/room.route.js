const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/room.controller");

router.get("/detail/:id_room", controller.detail);



module.exports = router;

