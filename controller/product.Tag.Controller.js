const { default: mongoose } = require('mongoose')
const Tag = require('../model/product.tag.model')

exports.add_Tag = async (req, res) => {
    try {
        const { tag, slug, description } = req.body

        if (!tag) {
            return res.status(200).json({ status: false, message: "tag is required!" })
        }

        if (!slug) {
            return res.status(200).json({ status: false, message: "slug is required!" })
        }

        const modifiedSlug = slug.replace(/\s+/g, '-');

        const add_Tag = await Tag({
            tag,
            slug: modifiedSlug,
            description
        })

        const result = await add_Tag.save()

        if (result) {
            return res.status(200).json({ status: true, message: "tag successfully add" , tag : result})
        } else {
            return res.status(200).json({ status: false, message: "tag not add!" })
        }

    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

exports.update_Tag = async (req, res) => {
    try {
        const { tag_id, tag, slug, description } = req.body

        if (!tag_id) {
            return res.status(200).json({ status: false, message: "tag_id is required!" })
        }

        if (!tag) {
            return res.status(200).json({ status: false, message: "tag is required!" })
        }

        if (!slug) {
            return res.status(200).json({ status: false, message: "slug is required!" })
        }

        const modifiedSlug = slug.replace(/\s+/g, '-');

        if (!mongoose.isValidObjectId(tag_id)) {
            return res.status(200).json({ status: false, message: "invalid id!" })
        }

        const data = await Tag.findOne({ _id: tag_id })

        if (!data) {
            return res.status(200).json({ status: false, message: "tag not found!" })
        }

        if (data) {
            data.tag = tag,
                data.slug = modifiedSlug,
                data.description = description
        }

        const result = await data.save()

        if (result) {
            return res.status(200).json({ status: true, message: "tag successfully updated" , tag : result })
        } else {
            return res.status(200).json({ status: false, message: "tag not updated!" })
        }

    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

exports.get_Tag = async (req, res) => {
    try {
        const data = await Tag.find()
        if (!data || data.length === 0) {
            return res.status(200).json({ status: false, message: "data not found!" })
        }

        if (data) {
            return res.status(200).json({ status: true, total : data.length , tag : data})
        }

    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

exports.get_One_Tag = async (req, res) => {
    try {

        const {tag_id} = req.body

        if (!tag_id) {
            return res.status(200).json({ status: false, message: "tag_id is required!" })
        }

        if (!mongoose.isValidObjectId(tag_id)) {
            return res.status(200).json({ status: false, message: "invalid id!" })
        }

        const data = await Tag.findOne()

        if (!data) {
            return res.status(200).json({ status: false, message: "data not found!" })
        }

        if (data) {
            return res.status(200).json({ status: true , tag : data})
        }

    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

exports.delete_Tag = async (req, res) => {
    try {

        const {tag_id} = req.body

        if (!tag_id) {
            return res.status(200).json({ status: false, message: "tag_id is required!" })
        }

        if (!mongoose.isValidObjectId(tag_id)) {
            return res.status(200).json({ status: false, message: "invalid id!" })
        }

        const data = await Tag.findOne({_id:tag_id})

        if (!data) {
            return res.status(200).json({ status: false, message: "tag not found!" })
        }

        const result = await Tag.deleteOne({_id:tag_id})

        if (result) {
            return res.status(200).json({ status: true, message: "tag delete successfully" , tag : data })
        } else {
            return res.status(200).json({ status: false, message: "data not found!" })
        }

    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}