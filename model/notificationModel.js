const mongoose = require('mongoose')

const notification = new mongoose.Schema({
    type: {
        type: String,
        enum: ['general', 'application'], //g = all user // appli = one user
        required: true
    },
    target: {
        type: String,
        enum: ['specific', 'user', 'guest'], // sp = user yeah guest dono mein se koi bhi (both)
        required: true
    },
    user_id: {
        type :mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    },
    subtype: {
        type: String,
        enum: ['software-update', 'update', 'offer'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image_id: {
        type :mongoose.Schema.Types.ObjectId ,
        ref: 'ImgUrl',
    },
    payload: {
        type: Object,
        required: true
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
}
);

const Notification = new mongoose.model('Notification', notification)

module.exports = Notification