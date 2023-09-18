const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    avatar: {
        type: String,
        required: false
    },
    role:{
        type:String,
        default: "user",
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {timestamps: true})

module.exports = mongoose.model('User',userSchema)