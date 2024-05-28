const OtpModel = require('../model/otpModel')
const otpGenerator = require('otp-generator')
const twilio = require('twilio')
require('dotenv').config()

const account = process.env.TWILIO_ACCOUNT_SID
const token = process.env.TWILIO_AUTH_TOKEN

const client = twilio(account, token)

const otpVerification = async (otpTime) => {
    // console.log("second:",otpTime);

    const cDateTime = new Date()
    var differenceValue = (otpTime - cDateTime.getTime())/1000;
    differenceValue /= 60;

    const minute = Math.abs(Math.round(differenceValue));

    // console.log("expiry minute:-"+minute);

    if (minute > 0.30) {
        return true
    }
    
    return false
}

exports.sendOtp = async (req,res) => {

    const {phoneNumber} = req.body

    const otp = otpGenerator.generate(6, {specialChars: false , lowerCaseAlphabets: false, upperCaseAlphabets: false })

    const cDate = new Date()

    await OtpModel.findOneAndUpdate(
        {phoneNumber},
        {otp:otp,otpExpiration: new Date(cDate.getTime())},
         {upsert:true , new : true , setDefaultsOnInsert:true}
        )

    await client.messages.create({
        body:`Your otp is ${otp}`,
        to:phoneNumber,
        from:process.env.TWILIO_MOBILE_NUMBER
    })

    res.status(200).json({status : true , message : "otp send successfully"})
}

exports.verifyOtp = async (req,res) => {
    const {phoneNumber , otp} = req.body 

    const otpData = await OtpModel.findOne({phoneNumber , otp})

    if (!otpData) {
        return res.status(200).json({status : false , message : "invalid otp!"})
    }

   const otpExpired = await otpVerification(otpData.otpExpiration)

   if (otpExpired) {
    return res.status(200).json({status : false , message : "otp expired!"})
   }

   res.status(200).json({status : true , message : "otp verified successfully"})

}

