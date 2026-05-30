const express = require('express');
const router = express.Router();

const controller = require('../../controllers/admin/auth.controller');

const authValidate = require("../../validate/admin/auth.validate");


router.post("/login", authValidate.login, controller.login);

module.exports = router;