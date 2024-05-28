const mongoose = require("mongoose");

const tagSchema = mongoose.Schema({
    tag:{
        type:String,
        required:true
    },
    slug:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:false
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

const tag = new mongoose.model("tag", tagSchema)

module.exports = tag