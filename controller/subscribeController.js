const Subscribe = require('../model/subscribe')
const email_validator = require('email-validator')
const is_phone_number = require('is-phone-number')
const { mongoose } = require('mongoose')

exports.addSubscribe = async (req, res) => {

    try {
        const { name, email, phoneNumber, subject } = req.body
        const validation = [ "name", "email", "phoneNumber", "subject" ]

        for (let i = 0; i < validation.length; i++) {

                const fieldName = validation[i];
                
                if (!req.body[fieldName]) {
                return res.status(200).json({ status: false, message: `${fieldName} is required!` });
                }
            }
        if (email_validator.validate(email) && is_phone_number(phoneNumber)) {
            const subscribe = await Subscribe({
                name,
                email,
                phoneNumber,
                subject
            })
            await subscribe.save()
            return res.status(200).json({ status: true, message: "subscribe add successfully" })
        } else {
            return res.status(200).json({ status: false, message: "please enter valid email and phone_number!" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

exports.updateSubscribe = async (req, res) => {

    try {
        const { subscribe_id, name, email, phoneNumber, subject } = req.body
        const validation = [ "subscribe_id","name", "email", "phoneNumber", "subject" ]

        for (let i = 0; i < validation.length; i++) {

                const fieldName = validation[i];
                
                if (!req.body[fieldName]) {
                return res.status(200).json({ status: false, message: `${fieldName} is required!` });
                }
            }
        if (mongoose.isValidObjectId(subscribe_id)) {
            const subscribe = await Subscribe.findOne({ _id: subscribe_id })
            if (subscribe) {

                if (email_validator.validate(email) && is_phone_number(phoneNumber)) {

                    subscribe.name = name,
                        subscribe.email = email,
                        subscribe.phoneNumber = phoneNumber,
                        subscribe.subject = subject,
                        subscribe.updatedAt = new Date()

                    await subscribe.save()
                    return res.status(200).json({ status: true, message: "subscribe updated successfully" })

                } else {
                    return res.status(200).json({ status: false, message: "please enter valid email and phone_number!" })
                }
            } else {
                return res.status(200).json({ status: false, message: "subscribe not found!" })
            }
        } else {
            return res.status(200).json({ status: false, message: "please enter valid id!" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

exports.deleteSubscribe = async (req, res) => {

    try {
        const { subscribe_id } = req.body
        if (!subscribe_id) {
            return res.status(200).json({status:false , message : "subscribe_id is required!"})
        }
        if (mongoose.isValidObjectId(subscribe_id)) {
            const subscribe = await Subscribe.findOne({ _id: subscribe_id })
            if (subscribe) {
                const result = await Subscribe.deleteOne({ _id: subscribe_id })
                if (result) {
                    return res.status(200).json({ status: true, message: "subscribe deleted successfully" })
                } else {
                    return res.status(200).json({ status: true, message: "subscribe not deleted!" })
                }
            } else {
                return res.status(200).json({ status: false, message: "subscribe not found!" })
            }
        } else {
            return res.status(200).json({ status: false, message: "please enter valid id!" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

exports.getAllSubscribe = async (req, res) => {

    try {
        const subscribe = await Subscribe.find()
        if (subscribe) {
            return res.status(200).json({ status: true, total: subscribe.length, subscribe: subscribe })
        } else {
            return res.status(200).json({ status: false, message: "subscribe not get!" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

exports.getOneSubscribe = async (req, res) => {

    try {
        const { subscribe_id } = req.body
        if (!subscribe_id) {
            return res.status(200).json({status:false , message : "subscribe_id is required!"})
        }
        if (mongoose.isValidObjectId(subscribe_id)) {
            const subscribe = await Subscribe.findOne({ _id: subscribe_id })
            if (subscribe) {
                return res.status(200).json({ status: true, total: subscribe.length, subscribe: subscribe })
            } else {
                return res.status(200).json({ status: false, message: "subscribe not found!" })
            }
        } else {
            return res.status(200).json({ status: false, message: "please enter valid id!" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}