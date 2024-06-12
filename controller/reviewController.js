const { default: mongoose } = require('mongoose')
const Review = require('../model/reviewModel')
const Cart = require('../model/cart')

exports.addReview = async (req, res) => {
    try {
    const { product_id, order_id, rating, note, isDeleted } = req.body
    const validation = ["product_id", "order_id", "rating", "note", "isDeleted"]

        for (let i = 0; i < validation.length; i++) {

                const fieldName = validation[i];
                
                if (!req.body[fieldName]) {
                return res.status(200).json({ status: false, message: `${fieldName} is required!` });
                }
            }

    if (mongoose.isValidObjectId(product_id) && mongoose.isValidObjectId(order_id)) {
        const cart = await Cart.findOne({ _id: order_id })
        if (cart) {

            const product = cart.products.find(product => product.product_Id.equals(product_id));

            if (product) {
                if (rating >= 0 && rating <= 5) {
                    const review = await Review({
                        user_id: req.user._id,
                        product_id,
                        order_id,
                        rating: Math.round(rating),
                        note,
                        isDeleted
                    })

                    await review.save()
                    return res.status(200).json({ status: true, message: "successfully add", review: review })
                }
                else {
                    return res.status(200).json({ status: false, message: "enter valid rating!" })
                }


            } else {
                return res.status(200).json({ status: false, message: "product not found!" })
            }

        } else {
            return res.status(200).json({ status: false, message: "user cart not found!" })
        }
    } else {
        return res.status(200).json({ status: false, message: "id not valid!" })
    }
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}
}

exports.updateReview = async (req, res) => {
    try {   
    const { review_id, product_id, order_id, rating, note , isDeleted} = req.body
    const validation = ["product_id", "review_id","order_id", "rating", "note", "isDeleted"]

        for (let i = 0; i < validation.length; i++) {

                const fieldName = validation[i];
                
                if (!req.body[fieldName]) {
                return res.status(200).json({ status: false, message: `${fieldName} is required!` });
                }
            }
    if (mongoose.isValidObjectId(review_id)) {
        const review = await Review.findOne({ user_id : req.user_id , _id: review_id })
        if (review.isDeleted === false) {

            if (rating >= 0 && rating <= 5) {

                review.rating = rating,
                review.note = note,
                review.product_id = product_id,
                review.order_id = order_id,
                review.isDeleted = isDeleted,
                review.updatedAt = new Date()

                await review.save()
                return res.status(200).json({ status: true, message: "review updated" })
            }
            else {
                return res.status(200).json({ status: false, message: "enter valid rating!" })
            }
        } else {
            return res.status(200).json({ status: false, message: "review not found!" })
        }
    } else {
        return res.status(200).json({ status: false, message: "id not valid!" })
    }
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}
}

exports.deleteReview = async (req, res) => {
    try {
    const { review_id } = req.body
    if (!review_id) {
        return res.status(200).json({status:false , message : "review_id is required!"})
    }
    if (mongoose.isValidObjectId(review_id)) {
        const review = await Review.findOne({user_id :req.user_id ,  _id: review_id })
        if (review.isDeleted === false) {
            review.isDeleted = true

            await review.save()
            return res.status(200).json({ status: true, message: "review delate" })

        } else {
            return res.status(200).json({ status: false, message: "review not found!" })
        }
    } else {
        return res.status(200).json({ status: false, message: "id not valid!" })
    }
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}
}

exports.getReview = async (req, res) => {
    try {
    const review = await Review.find({ user_id: req.user._id })
    if (review) {
        return res.status(200).json({ status: true, total: review.length, review: review })
    } else {
        return res.status(200).json({ status: false, message: "review not found!" })
    }
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}
}

exports.getOneReview = async (req, res) => {
    try {
    const { review_id } = req.body
    if (!review_id) {
        return res.status(200).json({status:false , message : "review_id is required!"})
    }
    if (mongoose.isValidObjectId(review_id)) {
        const review = await Review.findOne({user_id : req.user._id , _id: review_id })
        if (review) {
            return res.status(200).json({ status: true, review: review })
        } else {
            return res.status(200).json({ status: false, message: "review not found!" })
        }
    }
    else {
        return res.status(200).json({ status: false, message: "id not valid!" })
    }
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}
}