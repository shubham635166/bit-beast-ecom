// const mongoose = require('mongoose');


// const variationOneSchema =new mongoose.Schema({
//     variant:{
//         type:String,
//         required:true
//     },
//     regularPrice:{
//         type : Number,
//         required : true,
//         default: 0
//     },
//     salePrice:{
//         type : Number,
//         required : true,
//         default : 0
//     },
//     discount:{
//         type: Number,
//         required :false,
//         default: 0
//     },
//     stock:{
//         type:Number,
//         required:true,
//         default:0
//     },
//     color:{
//         type:String,
//         required:false
//     },
//     size:{
//         type:String,
//         enum:["L","X","XL","XXL","M"],
//         default:"X"
//     }
// })

// const productOne = mongoose.Schema({
//     name:{
//         type : String,
//         required : true
//     },
//     type:{
//         type:String,
//         required: false,
//         enum:["simple","variation"],
//         default:"simple"
//     },
//     regularPrice:{
//         type : Number,
//         required : true
//     },
//     salePrice:{
//         type : Number,
//         required : true
//     },
//     description:{
//         type : String,
//         required : true
//     },
//     discount:{
//         type: Number,
//         required :false,
//         default: 0
//     },
//     img_id:{
//         type :mongoose.Schema.Types.ObjectId ,
//         ref : "ImgUrl"
//     },
//     variation:[variationOneSchema],
//     isDeleted:{
//         type:Boolean,
//         default:false
//     },
//     stock:{
//         type:Number,
//         required:true,
//         default:0
//     },
//     color:{
//         type:String,
//         required:false
//     },
//     size:{
//         type:String,
//         enum:["L","X","XL","XXL","M"],
//         default:"X"
//     }
   
// },
//     {timestamps:true}
// )

// const ProductOne = new mongoose.model('ProductOne',productOne)

// module.exports = ProductOne

const mongoose = require("mongoose");

const task = new mongoose.Schema({
    color: {
        type: String,
        enum: ['red', 'blue', 'pink', 'white', 'black'],
        required: true
    },
    size: {
        type: String,
        enum: ['s', 'm', 'l', 'xl', 'xxl'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
}, {
    timestamps: {
        currentTime: () => {
            const ISTOffset = 330;
            const now = new Date();
            const ISTTime = new Date(now.getTime() + (ISTOffset * 60000));
            return ISTTime;
        }
    }
});

const Task = new mongoose.model("Task", task);

module.exports = Task;