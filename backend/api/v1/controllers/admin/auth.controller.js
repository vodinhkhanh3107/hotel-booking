const account = require("../../model/account.model");
const Account = require("../../model/account.model");




// [POST] /api/v1/management-hotel/auth/login
module.exports.login = async(req,res) => {
    const {email, password} = req.body;

    const existingAccount = await Account.findOne({
        email,
    });

    if(!existingAccount) {
        return res.json({
            status: 400,
            message: "Tài khoản hoặc mật khẩu không đúng!"
        })
    };
    
    if(existingAccount.status === "block"){
        return res.json({
            status: 403,
            message: "Tài khoản đã bị khóa!"
        })
    };
    

    if(existingAccount.password !== password) {
        return res.json({
            status: 400,
            message: "Tài khoản hoặc mật khẩu không đúng!"
        });
    };

    res.json({
        status: 200,
        account: {
            id: existingAccount.id,
            full_name: existingAccount.full_name,
            role: existingAccount.role,
            avartar: existingAccount.avartar,
            level: existingAccount.level,
            code_admin: existingAccount.code_admin
        },
        message: "Đăng nhập thành công!",
    })
    
}