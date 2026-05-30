const Partner = require("../../model/partner.model");
const jwt = require("jsonwebtoken");

// [POST] /api/v1/management-hotel/partner/auth/register
module.exports.register = async (req, res) => {
  try {
    const {
      full_name,
      name_bussiness,
      id_tax,
      address_bussiness,
      email,
      password,
      phone,
      confirm_password
    } = req.body;

    const existPartner = await Partner.findOne({
      email,
    });
    if (existPartner) {
      return res.json({
        status: 400,
        message: "Email đã tồn tại!",
      });
    }
    

    const newPartner = new Partner({
      full_name,
      name_bussiness,
      id_tax,
      address_bussiness,
      email,
      password,
      phone,
    });

    await newPartner.save();

    res.json({
      status: 201,
      message: "Đăng ký tài khoản thành công!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi hệ thống!",
    });
  }
};

// [POST] /api/v1/management-hotel/partner/auth/login
module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  const existingAccount = await Partner.findOne({
    email,
  });
  if (!existingAccount) {
    return res.json({
      status: 400,
      message: "Tài khoản hoặc mật khẩu không đúng!",
    });
  }

  if (existingAccount.status === "block") {
    return res.json({
      status: 403,
      message: "Tài khoản đã bị khóa!",
    });
  }

  if (existingAccount.password !== password) {
    return res.json({
      status: 400,
      message: "Tài khoản hoặc mật khẩu không đúng!",
    });
  }
  res.json({
    status: 200,
    account: {
        id: existingAccount.id,
        full_name: existingAccount.full_name,
        role: existingAccount.role,
        avartar: existingAccount.avartar,
    },
    message: "Đăng nhập thành công!",
  });
};
