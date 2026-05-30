const Partner = require("../../model/partner.model");

module.exports.register = async (req, res, next) => {
  const {
    name_bussiness,
    id_tax,
    address_bussiness,
    email,
    password,
    confirm_password,
  } = req.body;

  if (!name_bussiness || name_bussiness === "") {
    return res.status(400).json("Vui lòng nhập tên doanh nghiệp");
  }

  if (!id_tax || id_tax === "") {
    return res.status(400).json("Vui lòng nhập mã số thuế");
  }

  if (!address_bussiness || address_bussiness === "") {
    return res.status(400).json("Vui lòng nhập địa chỉ doanh nghiệp");
  }
  if (!email || email === "") {
    return res.status(400).json("Vui lòng nhập email");
  }
  if (password !== confirm_password) {
    return res.status(400).json("Mật khẩu xác nhận không khớp");
  }
  if (!password || password === "") {
    return res.status(400).json("Vui lòng nhập mật khẩu");
  }
  next();
};

module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if(!email || email === ""){
    return res.json({
      status: 400,
      message: "Vui Lòng nhập email"
    })
  }
  if(!password || password === ""){
    return res.json({
      status: 400,
      message: "Vui Lòng nhập mật khẩu"
    })
  }
  next();
};
