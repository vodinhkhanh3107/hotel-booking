const mogoose = require('mongoose');

const userSchema = new mogoose.Schema({
    full_name: {
        type: String,   
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,       
        required: true,
    },
    phone: {
        type: String,
    },
    status: {
        type: String,
        default: "active",
        enum: ["active","block"]
    },
    avartar: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        default: "Khách hàng"
    }

},
    {
        timestamps: true
    }
);

const user = mogoose.model('users', userSchema);

module.exports = user;