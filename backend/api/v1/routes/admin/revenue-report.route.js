const express = require("express");

const router = express.Router();

const controller = require("../../controllers/admin/revenue-report.controller");
router.get("/", controller.index);
router.get("/filter", controller.filter);




module.exports = router;