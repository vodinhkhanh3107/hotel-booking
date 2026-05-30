module.exports.create = (req, res, next) => {
  if (req.body.full_name === "" || !req.body.full_name) {
    return res.json({
      status: 400,
      message: "Vui lòng nhập họ tên!",
    });
  }
  if (req.body.email === "" || !req.body.email) {
    return res.json({
      status: 400,
      message: "Vui lòng nhập email!",
    });
  }
  if (req.body.password === "" || !req.body.password) {
    return res.json({
      status: 400,
      message: "Vui lòng nhập mật khẩu!",
    });
  };
  if (req.body.password !== req.body.confirm_password) {
    return res.json({
      status: 400,
      message: "Mật khẩu xác nhận chưa trùng khớp!",
    });
  }
  next();
};