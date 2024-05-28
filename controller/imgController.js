const multer = require('multer');
const ImgUrl = require('../model/imgModel');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './upload');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage }).single('image');

exports.upload = async (req, res, next) => {
  try {

  upload(req, res, async function (err) {

    if (err) {
      return res.status(200).json({ error: err.message });
    }

      const img = await ImgUrl.create({
        imgUrl: `http://localhost:2000/profile/${req.file.filename}`
        });

      return res.status(200).json({ message: "Product Image Successfully Added" });
   
  });
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}

};


exports.deleteImage = async (req,res,next)=>{
  try {

      const imageId = await ImgUrl.findById(req.body.id)
      if (!imageId) {
        res.status(200).json({ error: "Product Image Id Not Found" });
      }
      deleteImage = await ImgUrl.findByIdAndDelete(imageId)
      return res.status(200).json({ message: "Product Image Successfully Delete" });
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }

}

exports.getImage = async (req,res,next)=>{
  try {
    const image = await ImgUrl.find()
    return res.status(200).json({status:true , image : image});
  
 }
  catch (error) {
      return res.status(500).json({ status: false, message: "Internal Server Error" });
  }

}

exports.imgUpdate = async (req,res,next)=>{
  const {imgUrl} = `http://localhost:2000/profile/${req.file.filename}`
    try {
        ingUpdate = await ImgUrl.findByIdAndUpdate(req.body.id,{imgUrl , updatedAt : new Date()},{new:true})
        res.status(200).json({message : "Image updated"})
      }
      catch (error) {
          return res.status(500).json({ status: false, message: "Internal Server Error" });
      }
  
}