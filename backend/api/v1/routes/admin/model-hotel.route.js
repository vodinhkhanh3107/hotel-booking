const express = require("express");

const router = express.Router();

const controller = require("../../controllers/admin/model-hotel.controller");
router.get("/", controller.index);
router.post("/create", controller.create);
router.put("/edit/:id_model_hotel", controller.edit);



module.exports = router;