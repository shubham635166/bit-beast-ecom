const mongoose = require("mongoose");

const ScheduleSchema = mongoose.Schema({
    type: {
      type: String,
      enum: ["hour", "days"],
      default: "hour",
    },
    time:{
      type: String,
      default: "",
      required: true,
    }
  })

const templateSchema = mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    title:{
        type:String,
        required:false
    },
    type:{
        type:String,
        required: false,
        enum:["active","deActive","share"],
        default : "active"
    },
    canteen:{
        type:String,
        required:false
    },
    enable:{
        type:Boolean,
        default:false
    },
    schedule:[ScheduleSchema]
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


const Template = new mongoose.model("Template", templateSchema)

module.exports = Template