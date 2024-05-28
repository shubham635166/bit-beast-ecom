const { default: mongoose } = require('mongoose')
const Coupon = require('../model/couponModel')

exports.createCoupon = async (req, res) => {
    try {

        const { discount, couponCode, minSpend, maxSpend, expiryDate, amount, isUsed } = req.body

        const validation = ["discount", "couponCode", "minSpend", "maxSpend", "expiryDate", "amount", "isUsed"]

            for (let i = 0; i < validation.length; i++) {
                const fieldName = validation[i];

                if (!req.body[fieldName]) {
                    return res.status(200).json({ status: false, message: `${fieldName} is required!` });
                }
            }

        const coupon = await Coupon({
            discount,
            couponCode,
            minSpend,
            maxSpend,
            expiryDate,
            amount,
            isUsed
        })

        await coupon.save()
        res.status(200).send({ status: true, message: "successfully create coupon", coupon: coupon })
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }

}

exports.updateCoupon = async (req, res) => {
    try {
        const { coupon_Id, discount, couponCode, minSpend, maxSpend, expiryDate, amount, isUsed } = req.body

        const validation = ["coupon_Id","discount", "couponCode", "minSpend", "maxSpend", "expiryDate", "amount", "isUsed"]

            for (let i = 0; i < validation.length; i++) {
                const fieldName = validation[i];

                if (!req.body[fieldName]) {
                    return res.status(200).json({ status: false, message: `${fieldName} is required!` });
                }
            }

        if (mongoose.isValidObjectId(coupon_Id)) {
            const coupon = await Coupon.findOne({ _id: coupon_Id })
            if (coupon) {
                coupon.discount = discount,
                    coupon.couponCode = couponCode,
                    coupon.minSpend = minSpend,
                    coupon.maxSpend = maxSpend,
                    coupon.expiryDate = expiryDate,
                    coupon.amount = amount,
                    coupon.isUsed = isUsed,
                    coupon.updatedAt = new Date()
                await coupon.save()
                res.status(200).send({ status: true, message: "successfully coupon updated", coupon: coupon })
            } else {
                res.status(200).send({ status: false, message: "coupon id not found" })
            }
        } else {
            res.status(200).send({ status: false, message: "coupon id is not valid" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

exports.getAllCoupon = async (req, res) => {
    try {
        const allCoupon = await Coupon.find()
        return res.status(200).json({ status: true, total: allCoupon.length, allCoupon: allCoupon })
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

exports.getIdWithCoupon = async (req, res) => {
    try {
        const { coupon_Id } = req.body

        if (!coupon_Id) {
            return res.status(200).json({status:false , message : "coupon_Id is required!"})
        }

        if (mongoose.isValidObjectId(coupon_Id)) {
            const coupon = await Coupon.findOne({ _id: coupon_Id })
            if (coupon) {
                res.status(200).send({ status: true, coupon: coupon })
            } else {
                res.status(200).send({ status: false, message: "coupon id not found" })
            }
        } else {
            res.status(200).send({ status: false, message: "coupon id is not valid" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }

}

exports.deleteCoupon = async (req, res) => {
    try {
        const { coupon_Id } = req.body

        if (!coupon_Id) {
            return res.status(200).json({status:false , message : "coupon_Id is required!"})
        }
        
        if (mongoose.isValidObjectId(coupon_Id)) {
            const coupon = await Coupon.findOne({ _id: coupon_Id })
            if (coupon) {
                await Coupon.findByIdAndDelete({ _id: coupon_Id })
                res.status(200).send({ status: true, message: "Coupon Successfully Deleted" })
            } else {
                res.status(200).send({ status: false, message: "coupon not found" })
            }
        } else {
            res.status(200).send({ status: false, message: "coupon id is not valid" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }

}