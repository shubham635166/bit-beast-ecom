const { mongoose } = require('mongoose')
const wishList = require('../model/wishListModel')
const Product = require('../model/productModel')

exports.add_wishList = async (req, res) => {
    try {
    const { product_id } = req.body

    if (!product_id) {
        return res.status(200).json({status:false , message : "product_id is required!"})
    }

    const user = req.user._id

    const user_wishList = await wishList.findOne({ user_id: user })

    if (user_wishList) {
        if (mongoose.isValidObjectId(product_id)) {
            const product = await Product.findOne({ _id: product_id })
            if (product) {

                const productInWishList = await user_wishList.products.find(item => item.product_id.toString() === product_id);

                if (productInWishList) {
                    return res.status(400).json({ status: false, message: "product already added!" })
                }
                else {
                    user_wishList.products.push({ product_id }),
                    user_wishList.updatedAt = new Date()
                    await user_wishList.save()
                    return res.status(200).json({ status: true, message: "product add successfully in watchList" })
                }
            } else {
                return res.status(400).json({ status: false, message: "product not found!" })
            }
        }
        else {
            return res.status(400).json({ status: false, message: "invalid product_id !" })
        }
    } else {
        if (mongoose.isValidObjectId(product_id)) {
            const product = await Product.findOne({ _id: product_id })
            if (product) {
                const wish = await wishList({
                    user_id: user,
                    products: [{
                        product_id
                    }]
                })
                await wish.save()
                return res.status(200).json({ status: true, message: "product add successfully in watchList" })
            } else {
                return res.status(400).json({ status: false, message: "product not found!" })
            }
        }
        else {
            return res.status(400).json({ status: false, message: "invalid product_id !" })
        }
    }
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}
}

exports.removeWishListProduct = async (req, res) => {
    try {
    const { product_id } = req.body
    if (!product_id) {
        return res.status(200).json({status:false , message : "product_id is required!"})
    }
    if (mongoose.isValidObjectId(product_id)) {
        const WishList = await wishList.findOne({ user_id: req.user._id })
        if (WishList) {
            const wishListIndex = WishList.products.findIndex(product => product.product_id.equals(product_id));

            if (wishListIndex !== -1) {
                WishList.products.splice(wishListIndex, 1),
                    WishList.updatedAt = new Date()
                await WishList.save()
                res.status(200).send({ status: true, message: "product successfully removed" })
            } else {
                return res.status(400).json({ status: false, message: "product not found!" })
            }
        } else {
            return res.status(400).json({ status: false, message: "wishList not found!" })
        }
    } else {
        return res.status(400).json({ status: false, message: "invalid product_id !" })
    }
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}
}

exports.getWishList = async (req, res) => {
    try {
    const user_id = req.user._id
    const WishList = await wishList.find({ user_id: user_id }).populate('products.product_id')
    res.status(200).json({ status: true, wishlist: WishList.length, Wishlist: WishList })
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}
}

exports.removeWishList = async (req, res) => {
    try {
    const user_id = req.user._id
    const WishList = await wishList.findOne({ user_id: user_id })
    if (WishList) {
        const result = await wishList.deleteOne({ user_id: user_id })
        if (result) {
            return res.status(200).json({ status: true, message: "successfully user wishList removed" })
        } else {
            return res.status(400).json({ status: false, message: "not remove user wishList!" })
        }
    } else {
        return res.status(400).json({ status: false, message: "wishList not found!" })
    }
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}
}