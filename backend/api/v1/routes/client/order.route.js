const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/order.controller");

router.post("/checkout", controller.checkout);
router.get("/my-order/:id_user", controller.myOrder);
router.get("/detail/:code_order", controller.detailOrder);
router.post("/cancel/:id_order", controller.cancelOrder);




module.exports = router;

