const Partner = require("../../model/partner.model");

// [GET] /api/v1/management-hotel/my-account
module.exports.myAccount = async(req,res) => {
    const { id_partner } = req.params;

    const existingAccount = await Partner.findOne({
        _id: id_partner,
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

// [POST] /api/v1/management-hotel/partner/account/change-password/:id_partner
module.exports.changePassword = async(req,res) => {
    const { current_password, new_password, confirm_password } = req.body;
  const { id_partner } = req.params;

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

  const existAccount = await Partner.findOne({
    _id: id_partner
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
  
  const account = await Partner.findOneAndUpdate(
    {
      _id: id_partner,
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

// [POST] /api/v1/management-hotel/partner/account/change-info/:id_partner
module.exports.changeInfo = async(req,res) => {
    const { full_name, phone, id_tax, avartar } = req.body;
  const { id_partner } = req.params;

  if (!id_partner) {
    return res.json({
      status: 404,
      message: "Không tìm thấy id tài khoản hoặc tài khoản không tồn tại!",
    });
  }

  if (!full_name || full_name === "") {
    return res.json({
      status: 400,
      message: "Hãy điền thông tin họ và tên",
    });
  }
  if (!phone || phone === "") {
    return res.json({
      status: 400,
      message: "Hãy điền thông tin số điện thoại",
    });
  }

  const newInfoAccount = {
    full_name, 
    phone, 
    id_tax,
    avartar: avartar ? avartar : "",
  };
  const account = await Partner.findOneAndUpdate(
    {
      _id: id_partner,
      status: "active",
    },
    newInfoAccount,
  );

  res.json({
    status: 200,
    message: "Cập nhật thông tin tài khoản thành công!",
  });
}