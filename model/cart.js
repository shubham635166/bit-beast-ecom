const mongoose = require('mongoose')

const cartProductSchema = new mongoose.Schema(
    {
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        variation_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            default: null
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        productTotalPrice: {
            type: Number,
            required: false,
            default: 0
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

const cartSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        products: [cartProductSchema], // Use the cartProductSchema for the products array
        coupon_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coupon"
        },
        totalPrice: {
            type: Number,
            required: false,
            default: 0
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

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;