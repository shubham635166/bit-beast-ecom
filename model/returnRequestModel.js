const mongoose = require('mongoose')

const return_Request_schema = mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    order_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Cart'
    },
    type:{
        type : String,
        enum : ['order' , 'product'],
        default: 'product'
    },
    amount:{
        type:Number,
        default:0
    },
    order_item_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Cart'
    },
    note:{
        type:String,
        required: false
    },
    status:{
        type:String,
        enum:['pending','processing',"completed",'cancel','refunded'],
        default:'processing'
    },
    proof_image:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'ImgUrl'
    },
    refundedDate:{
        type:Date
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
const return_Request = new mongoose.model("return_Request",return_Request_schema)

module.exports = return_Request