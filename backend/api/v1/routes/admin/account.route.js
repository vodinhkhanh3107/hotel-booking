

const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/account.controller");

const authValidate = require("../../validate/admin/auth.validate");
const accountValidate = require("../../validate/admin/account.validate");


router.get("/", controller.index);
router.post("/create", accountValidate.create, controller.create);
router.get("/my-account/:id_admin", controller.myAccount);
router.put("/change-info/:id_admin", controller.changeInfo);
router.put("/change-password/:id_admin", controller.changePassword);
router.put("/update-status/", controller.updateStatusAccount);





module.exports = router;
