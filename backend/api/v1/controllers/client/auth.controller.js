const User = require("../../model/user.model");

// [POST] /api/v1/management-hotel/auth/register
module.exports.register = async (req, res) => {
  const { full_name, email, phone, password, confirm_password } = req.body;

  if (!full_name || full_name === "") {
    return res.json({
      status: 400,
      message: "Không được để trống họ tên!",
    });
  }
  if (!email || email === "") {
    return res.json({
      status: 400,
      message: "Không được để trống email!",
    });
  }
  if (!password || password === "") {
    return res.json({
      status: 400,
      message: "Không được để trống mật khẩu!",
    });
  }
  if (!phone || phone === "") {
    return res.json({
      status: 400,
      message: "Không được để trống số điện thoại!",
    });
  }
  if (!password || password === "") {
    return res.json({
      status: 400,
      message: "Không được để trống mật khẩu!",
    });
  }

  if (!confirm_password || confirm_password === "") {
    return res.json({
      status: 400,
      message: "Hãy xác nhận mật khẩu!",
    });
  }

  if (password !== confirm_password) {
    return res.json({
      status: 400,
      message: "Mật khẩu chưa khớp!",
    });
  }

  const existUser = await User.findOne({
    email,
  });
  if (existUser) {
    return res.json({
      status: 400,
      message: "Email đã tồn tại!",
    });
  }

  const newUser = new User({
    full_name,
    email,
    password,
    phone,
    password,
    confirm_password,
  });

  await newUser.save();

  res.json({
    status: 201,
    message: "Đăng ký tài khoản thành công!",
  });
};

// [POST] /api/v1/management-hotel/auth/login
module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  const existingAccount = await User.findOne({
    email,
  });
  console.log(existingAccount);
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
