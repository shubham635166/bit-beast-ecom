const mongoose = require("mongoose");

const review = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    cart_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    note: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
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
});
const Review = new mongoose.model("Review", review);
module.exports = Review;