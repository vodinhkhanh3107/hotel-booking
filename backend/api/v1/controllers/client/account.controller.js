const User = require("../../model/user.model");

// [GET] /api/v1/management-hotel/my-account
module.exports.myAccount = async(req,res) => {
    const { id_user } = req.params;

    const existingAccount = await User.findOne({
        _id: id_user,
    }).select("-password");

    if (!existingAccount) {
        return res.json({
            status: 400,
            message: "Tài khoản không tồn tại!",
        });
    }
    res.json({
        status: 200,
        account: existingAccount,
        message: "Lấy thông tin tài khoản thành công!",
    });
}

// [POST] /api/v1/management-hotel/change-info/:id_user
module.exports.changeInfo = async(req,res) => {
    const { full_name, phone, avartar } = req.body;
      const { id_user } = req.params;
    
      if (!full_name || full_name === "") {
        return res.json({
          status: 400,
          message: "Hãy điền thông tin họ và tên",
        });
      }
      if (!id_user) {
        return res.json({
          status: 400,
          message: "Không tìm thấy id tài khoản hoặc tài khoản không tồn tại!",
        });
      }
    
      const newInfoAccount = {
        full_name,
        phone: phone ? phone : "",
        avartar: avartar ? avartar : ""
      };
      const account = await User.findOneAndUpdate(
        {
          _id: id_user,
          status: "active",
        },
        newInfoAccount,
      );
    
      res.json({
        status: 200,
        message: "Cập nhật thông tin tài khoản thành công!"
      });
}

// [POST] /api/v1/management-hotel/account/change-password/:id_user
module.exports.changePassword = async (req,res) => {
    const { current_password, new_password, confirm_password } = req.body;
  const { id_user } = req.params;

  if (!current_password || current_password === "") {
    return res.json({
      status: 400,
      message: "Hãy điền mật khẩu hiện tại",
    });
  }
  
  if (!new_password || new_password === "") {
    return res.json({
      status: 400,
      message: "Hãy điền mật khẩu mới",
    });
  }
  if (!confirm_password || confirm_password === "") {
    return res.json({
      status: 400,
      message: "Hãy xác nhận mật khẩu mới",
    });
  }

  
  
  const existAccount = await User.findOne({
    _id: id_user
  });
  if (!existAccount) {
    return res.json({
      status: 404,
      message: "Không tìm thấy id tài khoản hoặc tài khoản không tồn tại!",
    });
  }
  if (existAccount.password !== current_password) {
    return res.json({
      status: 400,
      message: "Mật khẩu hiện tại chưa khớp",
    });
  }
  const account = await User.findOneAndUpdate(
    {
      _id: id_user,
      status: "active",
    },
    {
        password: new_password
    },
  );

  res.json({
    status: 200,
    message: "Cập nhật mật khẩu mới thành công!"
  });
}