const mongoose = require('mongoose')

const img = new mongoose.Schema({
    imgUrl:{
        type:String,
        require:true
    }
},
{
    timestamps: {
        currentTime: () => {
            const ISTOffset = 330;
            const now = new Date();
            const ISTTime = new Date(now.getTime() + (ISTOffset * 60000));
            return ISTTime;
        }
    }
})

const ImgUrl = new mongoose.model("ImgUrl",img)

module.exports = ImgUrl