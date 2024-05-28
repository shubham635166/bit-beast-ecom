const mongoose = require('mongoose')

const addressSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    type: {
        type: String,
        enum: [
            "home",
            "office",
            "other"
        ],
        default: "home"
    },
    address_Line_One: {
        type: String,
        required: true
    },
    address_Line_Two: {
        type: String,
        required: true
    },
    phone_Number: {
        type: Number,
        required: true
    },
    zip_Code: {
        type: Number,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
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


const Address = new mongoose.model("Address", addressSchema)

module.exports = Address