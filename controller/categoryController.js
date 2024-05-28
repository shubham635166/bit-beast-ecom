const { default: mongoose } = require("mongoose");
const ProductCategory = require("../model/productCategory")

exports.productCategory = async (req,res,next)=>{
    try {

    const {name,slug,description,img_id} = req.body

    const validation = ["name","slug","description","img_id"]

        for (let i = 0; i < validation.length; i++) {
                const fieldName = validation[i];
                
                if (!req.body[fieldName]) {
                return res.status(200).json({ status: false, message: `${fieldName} is required!` });
                }
        }
        
    if (!mongoose.isValidObjectId(img_id)) {
        return res.status(200).json({status:false , message : "invalid id!"})
    }

     const productCategory = await ProductCategory({
        name,
        slug,
        description,
        img_id
     });

     await productCategory.save()

     if (productCategory) {
        res.status(200).json({ message: "Category Added",categoryController : productCategory});
     }else{
        return res.status(200).json({status:false,message:"category not add!"})
     }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }


}

exports.updateCategory = async (req,res,next)=>{
    try {

    const {name,slug,description,img_id , category_id} = req.body
    const validation = ["name","slug","description","img_id" , "category_id"]

        for (let i = 0; i < validation.length; i++) {
            const fieldName = validation[i];
            
            if (!req.body[fieldName]) {
            return res.status(200).json({ status: false, message: `${fieldName} is required!` });
            }
        }

    if (!mongoose.isValidObjectId(category_id)) {
        return res.status(200).json({status:false , message : "invalid category_id!"})
    }

    if (!mongoose.isValidObjectId(img_id)) {
        return res.status(200).json({status:false , message : "invalid img_id!"})
    }

    const category = await ProductCategory.findOne({_id:category_id})

    if (category) {
        category.name = name,
        category.slug = slug,
        category.description = description,
        category.img_id = img_id
        category.updatedAt = new Date()

        const result = await category.save()

        return res.status(200).json({status:true , message : "category added successfully" , category:result })

    }else{
        return res.status(200).json({status:false , message : "category not found!"})
    }
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}


}

exports.deleteCategory = async (req,res,next)=>{
    try {

    const {category_id} = req.body

    if (!category_id) {
        return res.status(200).json({status:false , message : "category_id is required!"})
    }

    if (!mongoose.isValidObjectId(category_id)) {
        return res.status(200).json({status:false , message : "invalid category_id!"})
    }

    const category = await ProductCategory.findOne({_id:category_id})

    if (!category) {
        return res.status(200).json({status:false , message : "category not found!"})
    }

    const result = await ProductCategory.deleteOne({_id:category_id})
    if (result) {
        return res.status(200).json({status:true , message : "category successfully Delete"})  
    }else{
        return res.status(200).json({status:false , message : "category not Delete!"})  
    }
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}

}

exports.getCategory = async (req,res,next)=>{
    try {

        const {slug} = req.body

        if (slug) {
            const result = await ProductCategory.find({slug:slug})
            res.status(200).json({status:true , total : result.length , category : result})
        }

        else if (!slug) {
            const category = await ProductCategory.find()
            res.status(200).json({status:true , total : category.length , category : category})
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }

}