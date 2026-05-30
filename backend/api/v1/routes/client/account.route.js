

const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/account.controller");

router.get("/my-account/:id_user", controller.myAccount);
router.put("/change-info/:id_user", controller.changeInfo);
router.put("/change-password/:id_user", controller.changePassword);



module.exports = router;

