const { mongoose } = require('mongoose')
const Brand = require('../model/brandModel')

exports.addBrand = async (req, res) => {
    try {
        const { name, description, image_id, isFeatured } = req.body

        const validation = ["name", "description", "image_id", "isFeatured" ]

        for (let i = 0; i < validation.length; i++) {
                const fieldName = validation[i];
                
                if (!req.body[fieldName]) {
                return res.status(200).json({ status: false, message: `${fieldName} is required!` });
                }
        }
        if (!mongoose.isValidObjectId(image_id)) {
            return res.status(200).json({ status: false, message: "Invalid id!" })
        }

        const cheque = await Brand.findOne({ name: name })
        if (!cheque) {
            const brand = await Brand({
                name,
                description,
                image_id,
                isFeatured
            })
            if (brand) {
                await brand.save()
                return res.status(200).json({ status: true, message: "Brand Add!" })
            } else {
                return res.status(200).json({ status: false, message: "Brand not add!" })
            }
        } else {
            return res.status(200).json({ status: false, message: "Brand already exists!" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }

}

exports.updateBrand = async (req, res) => {
    try {
        const { brand_id, name, description, image_id, isFeatured } = req.body

        const validation = ["brand_id","name", "description", "image_id", "isFeatured" ]

        for (let i = 0; i < validation.length; i++) {
                const fieldName = validation[i];
                
                if (!req.body[fieldName]) {
                return res.status(200).json({ status: false, message: `${fieldName} is required!` });
                }
        }

        if (!mongoose.isValidObjectId(image_id)) {
            return res.status(200).json({ status: false, message: "Invalid id!" })
        }

        if (mongoose.isValidObjectId(brand_id)) {
            const brand = await Brand.findOne({ _id: brand_id })
            if (brand) {
                brand.name = name;
                brand.description = description;
                brand.image_id = image_id;
                brand.isFeatured = isFeatured;
                brand.updatedAt = new Date()

                await brand.save()
                return res.status(200).json({ status: true, message: "Brand successfully updated" })

            } else {
                return res.status(200).json({ status: false, message: "Brand not found!" })
            }
        } else {
            return res.status(200).json({ status: false, message: "Invalid brand_id!" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }

}

exports.getBrand = async (req, res) => {
    try {
        const brand = await Brand.find().populate('image_id')
        if (brand) {
            return res.status(200).json({ status: true, total: brand.length, brand: brand })
        } else {
            return res.status(200).json({ status: false, message: "Brand not found!" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }

}

exports.getOneBrand = async (req, res) => {
    try {
        const { brand_id } = req.body

        if (!brand_id) {
            return res.status(200).json({status:false , message : "brand_id is required!"})
        }

        if (mongoose.isValidObjectId(brand_id)) {
            const brand = await Brand.findOne({ _id: brand_id }).populate('image_id')
            if (brand) {
                return res.status(200).json({ status: true, brand: brand })
            } else {
                return res.status(200).json({ status: false, message: "Brand not found!" })
            }
        } else {
            return res.status(200).json({ status: false, message: "Invalid brand_id!" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }

}

exports.deleteBrand = async (req, res) => {
    try {
        const { brand_id } = req.body
        
        if (!brand_id) {
            return res.status(200).json({status:false , message : "brand_id is required!"})
        }

        if (mongoose.isValidObjectId(brand_id)) {
            const brand = await Brand.findOne({ _id: brand_id })
            if (brand) {
                const result = await Brand.deleteOne({ _id: brand_id })
                if (result) {
                    return res.status(200).json({ status: true, message: "Brand successfully deleted" })
                } else {
                    return res.status(200).json({ status: false, message: "Brand not deleted!" })
                }
            } else {
                return res.status(200).json({ status: false, message: "Brand not found!" })
            }
        } else {
            return res.status(200).json({ status: false, message: "Invalid brand_id!" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }

}