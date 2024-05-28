const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const couponSchema = mongoose.Schema({
    discount:{
        type:String,
        enum:[
            "percentage-discount",
            "fixed-cart-discount",
            "fixed-product-discount"
        ],
        default:"percentage-discount"
    },
    couponCode:{
        type : String,
        require : true
    },
    amount:{
        type:Number,
        default:0,
        require:false
    },
    minSpend:{
        type : Number,
        require: false,
        default : 0
    },
    maxSpend:{
        type:Number,
        require:false,
        default:0
    },
    expiryDate:{
        type : Date,
        require:false
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

const Coupon = mongoose.model("coupon", couponSchema);
module.exports = Coupon;