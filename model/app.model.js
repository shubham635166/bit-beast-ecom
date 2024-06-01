const { default: mongoose } = require("mongoose");

const appSchema = new mongoose.Schema({
    header: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ImgUrl"
    },
    footer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ImgUrl"
    },
    loading: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ImgUrl"
    },
    favicon:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ImgUrl"
    }
},
{
    timestamps: {
        currentTime: () => {
            const ISTOffset = 330; // Offset in minutes for IST
            const now = new Date();
            const ISTTime = new Date(now.getTime() + (ISTOffset * 60000));
            return ISTTime;
        }
    }
});

const App = mongoose.model('App', appSchema);
module.exports = App