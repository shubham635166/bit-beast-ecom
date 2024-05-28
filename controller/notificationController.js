const User = require('../model/userModel')
const Notification = require('../model/notificationModel');
const { default: mongoose } = require('mongoose');

exports.send_Notification = async (req, res) => {
    try {
        const { type, target, user_id, subtype, title, description, image, payload } = req.body;

        const validation = ["type", "target", "user_id", "subtype", "title", "description", "image", "payload"]

            for (let i = 0; i < validation.length; i++) {
                const fieldName = validation[i];

                if (!req.body[fieldName]) {
                    return res.status(200).json({ status: false, message: `${fieldName} is required!` });
                }
            }


        let notifications = [];
        const baseNotification = {
            type,
            subtype,
            title,
            description,
            image,
            payload
        };
        if (type === 'general' || type === 'application') {
            if (target === 'specific') {
                if (!user_id) {
                    return res.status(200).json({ success: false, message: "User ID is required for specific target" });
                }
                const specificUser = await User.findOne({ _id: user_id });
                if (!specificUser) {
                    return res.status(404).json({ success: false, message: "User not found" });
                }
                notifications = [{
                    ...baseNotification,
                    user_id: specificUser._id,
                    target: 'specific'
                }];
            }
            else if (target === 'user' || target === 'guest') {
                const users = target === 'user' ? await User.find({ type: 'user' }, '_id') : await User.find({ type: 'guest' }, '_id');
                if (users.length > 0) {
                    notifications = [{
                        ...baseNotification,
                        target,
                    }];

                } else {
                    return res.status(200).json({ success: false, message: `No ${target} found` });
                }
            } else {
                return res.status(200).json({ success: false, message: "Invalid Type" });
            }
        }
        else {
            return res.status(200).json({ success: false, message: "Invalid notification type" });
        }

        for (let i = 0; i < notifications.length; i++) {
            await Notification.create(notifications[i]);
        }

        res.status(201).json({ success: true, message: "Notifications sent successfully", notifications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.update_Notification = async (req, res) => {
    try {
        const { notification_id, type, target, title, description, image, payload, user_id } = req.body;


        const validation = ["notification_id", "type", "target", "user_id", "subtype", "title", "description", "image", "payload"]

            for (let i = 0; i < validation.length; i++) {
                const fieldName = validation[i];

                if (!req.body[fieldName]) {
                    return res.status(200).json({ status: false, message: `${fieldName} is required!` });
                }
            }


        if (!mongoose.isValidObjectId(notification_id)) {
            return res.status(200).json({ success: false, message: 'Invalid notification ID!' });
        }
        const updateObject = {
            type,
            target,
            title,
            description,
            image,
            payload
        };
        if (target === 'specific') {
            updateObject.user_id = user_id;
        } else if (target === 'user' || target === 'guest') {
            updateObject.$unset = { user_id: 1 };
        }
        const notification = await Notification.findByIdAndUpdate(notification_id, updateObject, { updatedAt: new Date() });
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.status(200).json({ success: true, message: 'Notification updated successfully', notification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.get_Notification = async (req, res) => {
    try {
        const { type } = req.body;
        const user = req.user.type;
        const user_id = req.user._id;


        if (!type) {
            return res.status(200).json({ status: false, message: "type is required!" })
        }

        //   console.log("role",req.user)
        if (type === 'general' || type === 'application') {
            const notifications = await Notification.find({ $or: [{ target: user }, { $and: [{ target: 'specific' }] }], $or: [{ $and: [{ user_id: user_id }] }] });

            return res.status(200).json({ success: true, total: notifications.length, notifications: notifications });

        }
        else {
            return res.status(200).json({ success: false, message: 'Invalid notification type' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.pre_view_notification = async (req, res) => {
    try {

        const { notification_id } = req.body;
        const user = req.user.type;
        const user_id = req.user._id;


        if (!notification_id) {
            return res.status(200).json({ status: false, message: "notification_id is required!" })
        }
        if (!mongoose.isValidObjectId(notification_id)) {
            return res.status(200).json({ success: false, message: 'Invalid ID!' });
        }

        const notification = await Notification.findOne({ _id: notification_id, $or: [{ target: user }, { $and: [{ target: 'specific' }] }], $or: [{ $and: [{ user_id: user_id }] }] });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        return res.status(200).json({ success: true, notification });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

exports.delete_many_notification = async (req, res) => {

    try {

    const user = req.user.type;
    console.log("user", user)
    const user_id = req.user._id;

    console.log("user", user_id)
    const notification = await Notification.find({ $or: [{ target: user }, { $and: [{ target: 'specific' }] }], $or: [{ target: user }, { $and: [{ user_id: user_id }] }] });


    if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await Notification.deleteMany({ $or: [{ target: user }, { $and: [{ target: 'specific' }] }], $or: [{ target: user }, { $and: [{ user_id: user_id }] }] });

    return res.status(200).json({ success: true, total: notification.length, notifications: notification });
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}

}

exports.delete_One_Notification = async (req, res) => {
    try {
    const { notification_id } = req.body;
    if (!notification_id) {
        return res.status(200).json({status:false , message : "notification_id is required!"})
    }
    const user = req.user.type;
    const user_id = req.user._id;

    if (!mongoose.isValidObjectId(notification_id)) {
        return res.status(200).json({ success: false, message: 'Invalid ID!' });
    }

    const data = await Notification.findOneAndDelete({ _id: notification_id, $or: [{ target: user }, { $and: [{ target: 'specific' }] }], $or: [{ target: user }, { $and: [{ user_id: user_id }] }] });

    if (!data) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.status(200).json({ success: true, message: "delete successfully", data: data });
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}

}