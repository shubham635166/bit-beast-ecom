const mongoose = require('mongoose')

const brandSchema = new mongoose.Schema({
    name:{
        type: String,
        required : true
    },
    description:{
        type: String,
        require : false
    },
    image_id:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "ImgUrl"
    },
    isFeatured:{
        type : Boolean,
        default : false
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


const Brand = new mongoose.model('Brand',brandSchema)
module.exports = Brand