const Return = require('../model/returnRequestModel')
const Cart = require('../model/cart')
const { mongoose } = require('mongoose')

// exports.return_request_controller = async (req, res) => {
//     try {
//         const { order_id, type, note, status, proof_image } = req.body;

//         const validation = ["order_id", "type", "note", "proof_image"];

//         for (let i = 0; i < validation.length; i++) {
//             const fieldName = validation[i];
//             if (!req.body[fieldName]) {
//                 return res.status(200).json({ status: false, message: `${fieldName} is required!` });
//             }
//         }

//         let order_item_id

//         if (type === "order") {
//             if (!req.body.order_item_id) {
//                 order_item_id = null
//             }else{
//                 return res.status(200).json({ status: false, message: "Please remove order_item_id!" });
//             }
//         }
//         else if (type === "product") {
//             if (!req.body.order_item_id) {
//                 return res.status(200).json({ status: false, message: "Please add order_item_id!" });
//             }
//             order_item_id = req.body.order_item_id;
//         }

//         if (!mongoose.isValidObjectId(order_id)) {
//             return res.status(200).json({ status: false, message: "Invalid order_id!" });
//         }

//         const order = await Cart.findOne({ _id: order_id });
//         if (!order) {
//             return res.status(200).json({ status: false, message: "Order not found!" });
//         }

//         const returnRequest = await Return.findOne({user_id:req.user._id , order_id : order_id , order_item_id : order_item_id})

//         if (returnRequest) {
//             return res.status(200).json({status : false , message:"return request exists!"})
//         }

//         const createdAtLimit = new Date();
//         createdAtLimit.setDate(createdAtLimit.getDate() - 7); // Subtract 7 days

//         if (order.createdAt < createdAtLimit) {
//             return res.status(200).json({ status: false, message: "Order was created more than 7 days ago, cannot process return!" });
//         }

//         if (type === "order") {
//             const return_item = new Return({
//                 user_id: req.user._id,
//                 order_id,
//                 order_item_id,
//                 type,
//                 amount: order.totalPrice,
//                 note,
//                 status: "processing",
//                 proof_image
//             });
//             await return_item.save();
//             return res.status(200).json({ status: true, message: "Return request sent successfully" , return : return_item });
//         } else {

//             if (!mongoose.isValidObjectId(order_item_id)) {
//                 return res.status(200).json({ status: false, message: "Invalid order_item_id!" });
//             }

//             const orderItem = order.products.find(product => product._id.toString() === order_item_id);
//             if (!orderItem) {
//                 return res.status(200).json({ status: false, message: "Order item not found!" });
//             }

//             const productCreatedAtLimit = new Date();
//             productCreatedAtLimit.setDate(productCreatedAtLimit.getDate() - 7); // Subtract 7 days

//             if (orderItem.createdAt < productCreatedAtLimit) {
//                 return res.status(200).json({ status: false, message: "Product was created more than 7 days ago, cannot process return!" });
//             }

//             const return_item = new Return({
//                 user_id: req.user._id,
//                 order_id,
//                 order_item_id,
//                 type,
//                 amount: orderItem.productTotalPrice,
//                 note,
//                 status,
//                 proof_image
//             });
//             await return_item.save();
//             return res.status(200).json({ status: true, message: "Return request sent successfully" , return : return_item });
//         }

//     } catch (error) {
//         return res.status(500).json({ status: false, message: "Internal Server Error" });
//     }
// // };

exports.return_request_controller = async (req, res) => {
    try {
        const { order_id, type, note, status, proof_image } = req.body;

        const requiredFields = ["order_id", "type" , "proof_image"];

        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(200).json({ status: false, message: `${field} is required!` });
            }
        }

        let order_item_id = null;

        if (type === "order") {
            if (req.body.order_item_id) {
                return res.status(200).json({ status: false, message: "Please remove order_item_id!" });
            }
        }
        else if (type === "product") {
            if (!req.body.order_item_id) {
                return res.status(200).json({ status: false, message: "Please add order_item_id!" });
            }
            order_item_id = req.body.order_item_id;
        }

        if (!mongoose.isValidObjectId(order_id)) {
            return res.status(200).json({ status: false, message: "Invalid order_id!" });
        }

        const order = await Cart.findOne({ _id: order_id });
            if (!order) {
                return res.status(200).json({ status: false, message: "Order not found!" });
            }

        if (type === "product") {
            const orderItem = order.products.find(product => product._id.toString() === order_item_id);
            if (!orderItem) {
                return res.status(200).json({ status: false, message: "Order item not found!" });
            }
        }

        const returnRequest = await Return.findOne({ user_id: req.user._id, order_id: order_id, order_item_id: order_item_id });
        if (returnRequest) {
            return res.status(200).json({ status: false, message: "Return request exists!" });
        }

        const createdAtLimit = new Date();
        createdAtLimit.setDate(createdAtLimit.getDate() - 7); // Subtract 7 days
        if (order.createdAt < createdAtLimit) {
            return res.status(200).json({ status: false, message: "Order was created more than 7 days ago, cannot process return!" });
        }

        const return_item = new Return({
            user_id: req.user._id,
            order_id,
            order_item_id,
            type,
            amount: type === "order" ? order.totalPrice : orderItem.productTotalPrice,
            note,
            status,
            proof_image
        });

        await return_item.save();
        return res.status(200).json({ status: true, message: "Return request sent successfully", return: return_item });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

exports.updateReturn = async (req, res) => {
    try {

        const { return_id, order_id, type, note, status, proof_image } = req.body

        const validation = ["return_id", "order_id", "type", "order_item_id", "note", "status", "proof_image"]

        for (let i = 0; i < validation.length; i++) {
            const fieldName = validation[i];

            if (!req.body[fieldName]) {
                return res.status(200).json({ status: false, message: `${fieldName} is required!` });
            }
        }

        let order_item_id

        if (type === "order") {
            if (!req.body.order_item_id) {
                order_item_id = null
            } else {
                return res.status(200).json({ status: false, message: "Please remove order_item_id!" });
            }
        }
        else if (type === "product") {
            if (!req.body.order_item_id) {
                return res.status(200).json({ status: false, message: "Please add order_item_id!" });
            }
            order_item_id = req.body.order_item_id;
        }

        if (mongoose.isValidObjectId(return_id)) {
            const returnPolicy = await Return.findOne({ _id: return_id })
            if (returnPolicy) {
                if (type === "order") {

                    // order

                    if (mongoose.isValidObjectId(order_id)) {
                        const order = await Cart.findOne({ _id: order_id })
                        if (order) {

                            returnPolicy.order_id = order_id,
                                returnPolicy.type = type,
                                returnPolicy.amount = order.totalPrice,
                                returnPolicy.note = note,
                                returnPolicy.status = status,
                                returnPolicy.proof_image = proof_image,
                                returnPolicy.updatedAt = new Date()

                            await returnPolicy.save()
                            res.status(200).json({ status: true, message: "return request updated successfully" })

                            if (status === "refunded") {

                                returnPolicy.refundedDate = new Date()
                                await returnPolicy.save()

                                if (order) {
                                    await Cart.deleteOne({ _id: order_id })
                                } else {
                                    res.status(200).json({ status: false, message: "order not found!" })
                                }
                            }

                        } else {
                            res.status(200).json({ status: false, message: "order not found!" })
                        }
                    } else {
                        res.status(200).json({ status: false, message: "invalid order_id id!" })
                    }
                } else {
                    // product 

                    if (mongoose.isValidObjectId(order_id)) {
                        const order = await Cart.findOne({ _id: order_id })
                        if (order) {
                            if (mongoose.isValidObjectId(order_item_id)) {
                                const orderItem = order.products.find(product => product._id.toString() === order_item_id);
                                if (orderItem) {

                                    returnPolicy.order_id = order_id,
                                        returnPolicy.type = type,
                                        returnPolicy.amount = orderItem.productTotalPrice,
                                        returnPolicy.note = note,
                                        returnPolicy.status = status,
                                        returnPolicy.proof_image = proof_image,
                                        returnPolicy.updatedAt = new Date()

                                    await returnPolicy.save()
                                    res.status(200).json({ status: true, message: "return request updated successfully" })

                                    if (status === "refunded") {


                                        returnPolicy.refundedDate = new Date()
                                        await returnPolicy.save()

                                        const itemIndex = order.products.findIndex(product => product._id === order_item_id);

                                        if (itemIndex !== -1) {
                                            order.products.splice(itemIndex, 1)
                                            await order.save()
                                            res.status(200).send({ status: true, message: "product successfully deleted" })
                                        } else {
                                            return res.status(200).json({ status: false, message: "product item not found!" })
                                        }
                                    }
                                }
                                else {
                                    return res.status(200).json({ status: false, message: "order item not found!" })
                                }
                            } else {
                                return res.status(200).json({ status: false, message: "invalid order_item_id id!" })
                            }
                        } else {
                            return res.status(200).json({ status: false, message: "order not found!" })
                        }
                    } else {
                        return res.status(200).json({ status: false, message: "invalid order_id id!" })
                    }
                }
            } else {
                return res.status(200).json({ status: false, message: "return policy not found!" })
            }
        } else {
            return res.status(200).json({ status: false, message: "invalid return_id id!" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

exports.getReturn = async (req, res) => {
    try {

        const result = await Return.find({user_id : req.user._id}).populate('proof_image')
        if (result) {
            return res.status(200).json({ status: true, total: result.length, returnData: result })
        } else {
            return res.status(200).json({ status: false, message: "return data not found" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

exports.getOneReturn = async (req, res) => {
    try {
        const { return_id } = req.body

        if (!return_id) {
            return res.status(200).json({ status: false, message: "return_id is required!" })
        }

        if (return_id) {
            const result = await Return.findOne({ user_id : req.user._id , _id: return_id }).populate('proof_image')
            if (result) {
                return res.status(200).json({ status: true, returnData: result })
            }else{
                return res.status(200).json({ status: false, message:"not found!" })
            }
        } else {
            return res.status(200).json({ status: false, message: "enter valid id!" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

exports.deleteReturn = async (req, res) => {
    try {

        const { return_id } = req.body

        if (!return_id) {
            return res.status(200).json({ status: false, message: "return_id is required!" })
        }

        if (return_id) {
            const result = await Return.findOne({user_id : req.user._id , _id: return_id })
            if (result) {
                await Return.deleteOne({user_id : req.user._id , _id: return_id })
                return res.status(200).json({ status: true, message: "return data successfully deleted" , returnData : result })
            } else {
                return res.status(200).json({ status: false, message: "return data not found!" })
            }
        } else {
            return res.status(200).json({ status: false, message: "enter valid id!" })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}