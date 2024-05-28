const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
    phoneNumber:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    otpExpiration:{
        type:Date,
        default:Date.now,
        get:(otpExpiration) => otpExpiration.getTime(),
        set:(otpExpiration) => new Date(otpExpiration)
    }

})

const Otp = mongoose.model('Otp',otpSchema)
module.exports = Otp