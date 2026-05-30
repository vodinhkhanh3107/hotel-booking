const express = require('express');
const router = express.Router();

const controller = require("../../controllers/partner/account.controller");

router.post("/change-password/:id_partner", controller.changePassword);
router.put("/change-info/:id_partner", controller.changeInfo);
router.get("/my-account/:id_partner", controller.myAccount);


module.exports = router;