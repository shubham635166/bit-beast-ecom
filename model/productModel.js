const mongoose = require('mongoose');


const variationSchema =new mongoose.Schema({
    variant:{
        type:String,
        required:true
    },
    sku:{
        type:String,
        required:true
    },
    regularPrice:{
        type : Number,
        required : true,
        default: 0
    },
    salePrice:{
        type : Number,
        required : true,
        default : 0
    },
    stock:{
        type:Number,
        required:true,
        default:0
    },
    isPublished:{
        type:Boolean,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    slug:{
        type:String,
        required:true
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

const product = mongoose.Schema({
    name:{
        type : String,
        required : true
    },
    type:{
        type:String,
        required: false,
        enum:["simple","variation"],
        default:"simple"
    },
    regularPrice:{
        type : Number,
        required : true,
        default: 0
    },
    salePrice:{
        type : Number,
        required : true,
        default : 0
    },
    description:{
        type : String,
        required : true
    },
    discount:{
        type: Number,
        required :false,
        default: 0
    },
    img_id:{
        type :mongoose.Schema.Types.ObjectId ,
        ref : "ImgUrl"
    },
    category_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"ProductCategory"
    },
    slug:{
        type:String,
        required :true
    },sku:{
        type:String,
        required:true
    },
    variation:[variationSchema],
    isPublished:{
        type:Boolean,
        required:true
    },
    isFeatured:{
        type:Boolean,
        required:false
    },
    isDisable:{
        type:Boolean,
        required:true
    },
    isDeleted:{
        type:Boolean,
        required:true
    },
    stock:{
        type:Number,
        required:true,
        default:0
    },
    brand_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Brand"
    },
    paid:{
        type:Boolean,
        default:false
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

const Product = new mongoose.model('Product',product)

module.exports = Product