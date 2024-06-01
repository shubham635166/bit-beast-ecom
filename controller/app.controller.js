const { default: mongoose } = require('mongoose');
const App = require('../model/app.model')
const Image = require('../model/imgModel')

exports.createApp = async(req,res)=>{
    const {image_id} = req.body

    const defaultImage = "665ae123acee09c742a700e7";

    const imageIdToUse = image_id || defaultImage;

    if (!mongoose.isValidObjectId(imageIdToUse)) {
        return res.status(200).json({status:false , message:"invalid image_id!"})
    }

    const image = await Image.findOne({_id:imageIdToUse})

    if (!image) {
        return res.status(200).json({status:false , message:"image not found!"})
    }

    const app = await App({
        header : image._id,
        footer : image._id,
        loading : image._id,
        favicon : image._id
    })

    const result = await app.save()

    if (result) {
        return res.status(200).json({status:true , message:"app create successfully" , App : result})
    } else {
        return res.status(200).json({status:false , message:"app not created!"})
    }
}

exports.updateApp = async(req,res)=>{
    const {app_id , image_id} = req.body

    if (!mongoose.isValidObjectId(app_id)) {
        return res.status(200).json({status:false , message:"invalid app_id!"})
    }

    const app = await App.findOne({_id:app_id})

    if (!app) {
        return res.status(200).json({status:false , message:"app not found!"})
    }

    if (!mongoose.isValidObjectId(image_id)) {
        return res.status(200).json({status:false , message:"invalid image_id!"})
    }

    const image = await Image.findOne({_id:image_id})

    if (!image) {
        return res.status(200).json({status:false , message:"image not found!"})
    }

    if (app) {
        app.header = image._id,
        app.footer = image._id,
        app.loading = image._id,
        app.favicon = image._id,
        app.updatedAt = new Date()
    }

    const result = await app.save()

    if (result) {
        return res.status(200).json({status:true , message:"app updated successfully" , App : result})
    } else {
        return res.status(200).json({status:false , message:"app not updated!"})
    }
}

exports.getApp = async(req,res)=>{
    const {app_id} = req.body

    const defaultApp = "665ad7e411b4eff03322e074";

    const appToUse = app_id || defaultApp;

    if (!mongoose.isValidObjectId(appToUse)) {
        return res.status(200).json({status:false , message:"invalid app_id!"})
    }

    const data = await App.findOne({_id : appToUse}).populate('header footer loading favicon')

    if (!data) {
        return res.status(200).json({status:false , message:"app not found!"})
    }

    return res.status(200).json({status:true , App:data})

}