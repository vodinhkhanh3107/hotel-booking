const express = require("express");

const router = express.Router();

const controller = require("../../controllers/admin/amenity.controller");


router.get("/", controller.index);
router.post("/create", controller.create);
router.put("/edit/:id_amenity", controller.update);
router.put("/change-status/:id_amenity", controller.changeStatus);



module.exports = router;