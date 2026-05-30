const mogoose = require('mongoose');

const accountSchema = new mogoose.Schema({
    avartar: {
        type: String,
        default: ""
    },
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
    code_admin: {
        type: Number
    },
    last_visit: {
        type: Date
    },
    role: {
        type: String,
        default: "Admin"
    },
    level: {
        type: Number,
        default: 2
    }

},
    {
        timestamps: true
    }
);

const account = mogoose.model('accounts', accountSchema);

module.exports = account;