const Account = require("../../model/account.model");
const User = require("../../model/user.model");
const Partner = require("../../model/partner.model");

// [GET] /api/v1/management-hotel/account
module.exports.index = async (req, res) => {
  const accountAdmins = await Account.find({}).select("-password");
  const accountUsers = await User.find({}).select("-password");
  const accountPartners = await Partner.find({}).select("-password");

  if (!accountAdmins || !accountUsers || !accountPartners) {
    return res.json({
      status: 200,
      message: "No accounts found",
    });
  }
  res.json({
    accounts: {
      admin: accountAdmins,
      user: accountUsers,
      partner: accountPartners,
    },
    status: 200,
  });
};

// [POST] /api/v1/management-hotel/account/create
module.exports.create = async (req, res) => {
  const { full_name, email, password, phone } = req.body;

  const existingAccount = await Account.findOne({
    email,
  });

  if (existingAccount) {
    return res.status(400).json({
      message: "Email đã tồn tại!",
    });
  }

  const totalAccount = await Account.countDocuments();

  const infoAcccount = {
    full_name,
    email,
    password,
    phone: phone ? phone : "",
    code_admin: Number(totalAccount) + 1,
  };

  const newAccount = new Account(infoAcccount);
  await newAccount.save();
  res.status(201).json({
    message: "Tạo tài khoản thành công!",
  });
};

// [GET] /api/v1/management-hotel/account/my-account/:id_admin
module.exports.myAccount = async (req, res) => {
  const { id_admin } = req.params;

  const existingAccount = await Account.findOne({
    _id: id_admin,
  }).select("-password");

  if (!existingAccount) {
    return res.status(403).json({
      message: "Tài khoản không tồn tại!",
    });
  }
  res.status(200).json({
    account: existingAccount,
    message: "Lấy thông tin tài khoản thành công!",
  });
};

// [POST] /api/v1/management-hotel/account/change-info/:id_admin
module.exports.changeInfo = async (req, res) => {
  const { full_name, phone, avartar } = req.body;
  const { id_admin } = req.params;

  if (!id_admin) {
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
    avartar: avartar ? avartar : "",
  };
  const account = await Account.findOneAndUpdate(
    {
      _id: id_admin,
      status: "active",
    },
    newInfoAccount,
  );

  res.json({
    status: 200,
    message: "Cập nhật thông tin tài khoản thành công!",
  });
};

// [POST] /api/v1/management-hotel/account/change-password/:id_admin
module.exports.changePassword = async (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;
  const { id_admin } = req.params;

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

  if (!id_admin) {
    return res.json({
      status: 400,
      message: "Không tìm thấy id tài khoản hoặc tài khoản không tồn tại!",
    });
  }

  const account = await Account.findOneAndUpdate(
    {
      _id: id_admin,
      status: "active",
    },
    {
      password: new_password,
    },
  );

  res.json({
    status: 200,
    message: "Cập nhật mật khẩu mới thành công!",
  });
};

// [POST] /api/v1/management-hotel/account/update-status/
module.exports.updateStatusAccount = async (req,res) => {
  const { id_account, status, role } = req.body;

  if(role === "Admin"){
    const accountAdmin = await Account.findOne({
      _id: id_account
    });

    if(!accountAdmin){
      return res.json({
        status: 400,
        message: "Không tìm thấy thông tin tài khoản trong hệ thống!"
      });
    }

    await Account.findOneAndUpdate({
      _id: id_account
    },{
      $set: { status: status === "active" ? "block" : "active" }
    })

  }

  else if(role === "Đối tác"){
    const accountPartner = await Partner.findOne({
      _id: id_account
    });

    if(!accountPartner){
      return res.json({
        status: 400,
        message: "Không tìm thấy thông tin tài khoản trong hệ thống!"
      });
    }

    await Partner.findOneAndUpdate({
      _id: id_account
    },{
      $set: { status: status === "active" ? "block" : "active" }
    })
  }

  else{
    const accountUser = await User.findOne({
      _id: id_account
    });

    if(!accountUser){
      return res.json({
        status: 400,
        message: "Không tìm thấy thông tin tài khoản trong hệ thống!"
      });
    }

    await User.findOneAndUpdate({
      _id: id_account
    },{
      $set: { status: status === "active" ? "block" : "active" }
    })
  }

  res.json({
    status: 200,
    message: "Cập nhật trạng thái thành công!"
  })

}


