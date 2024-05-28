const mongoose = require("mongoose");

const wishListSchema = mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    products:[{
        product_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref : "Product"
        }
    }]
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

const wishList = new mongoose.model("wishList", wishListSchema)

module.exports = wishList