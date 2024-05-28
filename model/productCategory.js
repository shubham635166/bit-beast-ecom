const mongoose = require('mongoose')

const productCategory = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: false
    },
    img_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ImgUrl"
    }
},
    { timestamps: true }
)

const ProductCategory = new mongoose.model("ProductCategory", productCategory)

module.exports = ProductCategory