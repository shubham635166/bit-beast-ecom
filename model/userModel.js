const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const key = require('../middleware/secreteKey')

const pagesSchema = new mongoose.Schema({
    "Privacy-Policy":{
        type:String,
        required:true
    },
    "Terms-And-Condition":{
        type:String,
        required:true
    },
    "Refund-Policy":{
        type:String,
        required:true
    }
})

const user = new mongoose.Schema({
    name:{
        type : String ,
        // required : true
    },
    email:{
        type : String,
        // required : true
    },
    password:{
        type : String,
        // required : true
    },
    age:{
        type : Number,
        // required : true
    },
    isPhoneNumber:{
        type:String,
        // required:true
    },
    type:{
        type : String,
        enum : ["guest","user"],
        default:"guest"
    },
    pages:{
     type : pagesSchema   
    }
},
{
    timestamps: {
        currentTime: () => {
            const ISTOffset = 330;
            const now = new Date();
            const ISTTime = new Date(now.getTime() + (ISTOffset * 60000));
            return ISTTime;
        }
    }
})

//JwT Token
user.methods.getJWTToken = function (){
    return jwt.sign({
        id: this.id,
        email: this.email
    }, key.key , { expiresIn: '7d' })
}

const User = new mongoose.model("User", user)

module.exports = User