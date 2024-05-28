const { default: mongoose } = require('mongoose')
const template = require('../model/templateModel')

exports.deleteTemplate = async (req, res) => {
    try {
        const templateData = await template.findOne({ user_id: req.user_id })

        if (templateData) {

            const result = await template.deleteOne({ user_id: req.user._id })
            if (result) {
                return res.status(200).json({ status: true, message: "template successfully deleted" })
            }
            else {
                return res.status(400).json({ status: false, message: "template not deleted!" })
            }

        }
        else {
            return res.status(400).json({ status: false, message: "template not found!" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

exports.getTemplate = async (req, res) => {
    try {
        const templateData = await template.find({ user_id: req.user_id })

        if (templateData) {
            return res.status(200).json({ status: true, template: templateData })
        }
        else {
            return res.status(400).json({ status: false, message: "template not found!" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }

}

exports.updateTemplate = async (req, res) => {
    try {
        const { title, type, canteen, enable } = req.body
        const validation = ["title", "type", "canteen", "enable"]

        for (let i = 0; i < validation.length; i++) {

                const fieldName = validation[i];
                
                if (!req.body[fieldName]) {
                return res.status(200).json({ status: false, message: `${fieldName} is required!` });
                }
            }
        const templateData = await template.findOne({ user_id: req.user_id })

        if (templateData) {

            templateData.title = title,
            templateData.type = type,
            templateData.canteen = canteen,
            templateData.enable = enable
            templateData.updatedAt = new Date()

            await templateData.save()
            return res.status(200).json({ status: true, message: "template successfully updated" })

        } else {
            return res.status(400).json({ status: false, message: "template not found!" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

exports.addSchedule = async (req, res) => {
    try {
        const { type, time } = req.body

        if (!type) {
            return res.status(200).json({status:false , message : "type is required!"})
        }
        if (!time) {
            return res.status(200).json({status:false , message : "time is required!"})
        }

        const templateData = await template.findOne({ user_id: req.user_id })

        if (templateData) {
            if (templateData.type === "deActive") {

                templateData.schedule.push({ type, time });
                await templateData.save()
                return res.status(200).json({ status: true, message: "schedule add successfully" })

            } else {
                return res.status(400).json({ status: false, message: "not active!" })
            }
        } else {
            return res.status(400).json({ status: false, message: "template not found!" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

exports.deleteSchedule = async (req, res) => {
    try {
        const { schedule_id } = req.body

        if (!schedule_id) {
            return res.status(200).json({status:false , message : "schedule_id is required!"})
        }

        const templateDate = await template.findOne({ user_id: req.user._id, _id: schedule_id })
        if (templateDate) {

            if (mongoose.isValidObjectId(schedule_id)) {

                const variationIndex = templateDate.schedule.findIndex(schedule => schedule._id.equals(schedule_id));

                if (variationIndex !== -1) {
                    templateDate.schedule.splice(variationIndex, 1);
                    await templateDate.save();
                    return res.status(200).json({ status: true, message: "schedule successfully deleted" });
                } else {
                    return res.status(404).json({ status: false, message: "schedule not found" });
                }

            } else {
                return res.status(400).json({ status: false, message: "not valid id!" })
            }

        } else {
            return res.status(400).json({ status: false, message: "not found!" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}