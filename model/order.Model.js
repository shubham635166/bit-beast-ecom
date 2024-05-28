const mongoose = require('mongoose')

const orderSubSchema = ({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity: {
        type: Number,
        require: true
    },
    price: {
        type: Number,
        require: false
    }
}
)

const orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    address_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address"
    },
    order_Item: [orderSubSchema]
    ,
    totalPrice: {
        type: Number,
        require: false
    },  
    status: {
        type: String,
        enum: ["pending", "processing", "delivered", "canceled"],
        default : "pending"
    },
    payment:{
        type:String,
        default:"COD"
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

const Order = new mongoose.model("Order", orderSchema)

module.exports = Order