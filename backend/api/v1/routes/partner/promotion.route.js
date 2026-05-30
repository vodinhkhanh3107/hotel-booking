const express = require("express");
const router = express.Router();

const controller = require("../../controllers/partner/promotion.controller");


router.get("/", controller.index);
router.post("/create", controller.create);
router.put("/edit/:id_promotion", controller.update);
router.put("/change-status/:id_promotion", controller.changeStatus);


module.exports = router;
