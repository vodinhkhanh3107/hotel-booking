
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  if (email === "" || !email) {
    return res.json({
      status: 400,
      message: "Vui lòng nhập email!",
    });
  }
  if (password === "" || !password) {
    return res.json({
      status: 400,
      message: "Vui lòng nhập mật khẩu!",
    });
  }
  next();
};
