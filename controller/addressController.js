const { default: mongoose } = require('mongoose')
const Address = require('../model/addressModel')

exports.createAddress = async (req, res) => {

    try {

    const { type, address_Line_One, address_Line_Two, phone_Number, zip_Code, city, state, country } = req.body


    const validation = ["type", "address_Line_One", "address_Line_Two", "phone_Number", "zip_Code", "city", "state", "country"]

        for (let i = 0; i < validation.length; i++) {
                const fieldName = validation[i];
                
                if (!req.body[fieldName]) {
                return res.status(200).json({ status: false, message: `${fieldName} is required!` });
                }
            }
        
    if (!type === "home" || !type === "office" || !type === "other") {
        return res.status(200).json({status : false , message : "select valid type!"})
    }

    const addressSave = Address({
        user_id: req.user._id,
        type,
        address_Line_One,
        address_Line_Two,
        phone_Number,
        zip_Code,
        city,
        state,
        country
    })
    const result = await addressSave.save()
    if (result) {
        return res.status(200).json({ state: true, message: "address add successfully" })
    }else{
        return res.status(200).json({status : false , message :"address not add!"})
    }
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}

}

exports.updateAddress = async (req, res) => {
    try {
    const { address_id, type, address_Line_One, address_Line_Two, phone_Number, zip_Code, city, state, country } = req.body

    
    const validation = ["address_id","type", "address_Line_One", "address_Line_Two", "phone_Number", "zip_Code", "city", "state", "country"]

        for (let i = 0; i < validation.length; i++) {
                const fieldName = validation[i];
                
                if (!req.body[fieldName]) {
                return res.status(200).json({ status: false, message: `${fieldName} is required!` });
                }
            }

    if (mongoose.isValidObjectId(address_id)) {

        if (!type === "home" || !type === "office" || !type === "other") {
            return res.status(200).json({status : false , message : "select valid type!"})
        }

        const address = await Address.findOne({user_id : req.user_id ,_id: address_id })

        if (address) {
                address.type = type,
                address.address_Line_One = address_Line_One,
                address.address_Line_Two = address_Line_Two,
                address.phone_Number = phone_Number,
                address.zip_Code = zip_Code,
                address.city = city,
                address.state = state,
                address.country = country,
                address.updatedAt = new Date()

                await address.save();
                return res.status(200).json({ state: true, message: "address updated successfully" })

        } else {
            return res.status(200).json({ status: false, message: "address not found" })
        }
    } else {
        return res.status(200).json({ status: false, message: "please enter valid id" })
    }
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}

}

exports.getAddress = async (req, res) => {
    try {
    const user_id = req.user._id
    const address = await Address.find({ user_id: user_id }).populate('user_id')

    if (address) {
        return res.status(200).json({ status: true, total: address.length, address: address })
    }else{
        return res.status(200).json({ status: false, message : "Address not found!" })
    }

}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}

}

exports.getOneAddress = async (req, res) => {
    try {
    const { address_id } = req.body

    if (!address_id) {
        return res.status(200).json({status:false , message : "address_id is required!"})
    }

    if (mongoose.isValidObjectId(address_id)) {
        const user_id = req.user._id
        const address = await Address.findOne({_id : address_id ,user_id: user_id }).populate('user_id')
        if (address) {
            return res.status(200).json({ status: true, address: address })            
        } else {
            return res.status(200).json({ status: false, message: "address not found" })
        }
    } else {
        return res.status(200).json({ status: false, message: "please enter valid id" })
    }
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}

}

exports.deleteAddress = async (req, res) => {
    try {
    const { address_id } = req.body
    
    if (!address_id) {
        return res.status(200).json({status:false , message : "address_id is required!"})
    }

    if (mongoose.isValidObjectId(address_id)) {
        const address = await Address.findOne({ _id: address_id, user_id: req.user._id })
        if (address) {
            const result = await Address.deleteOne({ _id: address_id, user_id: req.user._id })
            if (result) {
                return res.status(200).json({ status: true, message: "address successfully deletes" })
            } else {
                return res.status(200).json({ status: false, message: "address not found!" })
            }
        } else {
            return res.status(200).json({ status: false, message: "address not found" })
        }
    } else {
        return res.status(200).json({ status: false, message: "Invalid address id!" })
    }
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}

}