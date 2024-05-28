const mongoose = require('mongoose');
const Address = require('../model/addressModel');
const Order = require('../model/order.Model'); // Corrected the model name to `orderModel`
const Product = require('../model/productModel');
const User = require('../model/userModel');
const nodemailer = require('nodemailer');

// exports.add_Order = async (req, res) => {
//     const { address_id, order_Item, payment } = req.body;

//     if (!mongoose.isValidObjectId(address_id)) {
//         return res.status(200).json({ status: false, message: "Invalid address_id!" });
//     }

//     const address = await Address.findOne({ _id: address_id, user_id:req.user._id });

//     if (!address) {
//         return res.status(404).json({ status: false, message: "Address not found!" });
//     }

//     if (!Array.isArray(order_Item) || order_Item.length === 0) {
//         return res.status(200).json({ status: false, message: "Order item(s) missing!" });
//     }

//     let totalPrice = 0;
//     for (const item of order_Item) {
//         const { product_id, quantity } = item;

//         if (!mongoose.isValidObjectId(product_id)) {
//             return res.status(200).json({ status: false, message: `Invalid product_id: ${product_id}` });
//         }

//         if (typeof quantity !== 'number' || quantity <= 0) {
//             return res.status(200).json({ status: false, message: `Invalid quantity for product_id: ${product_id}` });
//         }

//         const product = await Product.findById(product_id);

//         if (!product) {
//             return res.status(404).json({ status: false, message: `Product not found for product_id: ${product_id}` });
//         }

//         if (item.quantity > product.stock ) {
//             return res.status(404).json({ status: false, message: `stock not available for product_id: ${product_id}` });

//         }

//         item.price = product.salePrice * quantity;
//         totalPrice += item.price;
//     }

//     const order = new Order({
//         user_id: req.user._id,
//         address_id,
//         order_Item,
//         totalPrice,
//         payment
//     });

//     try {
//         const data = await order.save();
//         return res.status(201).json({ status: true, message: "Order successfully added", order: data });
//     } catch (error) {
//         return res.status(200).json({ status: false, message: "Error adding order", error: error.message });
//     }
// };



// exports.oderEmailSend = async (req, res) => {
//     try {
//         // Extract user_id from the request body
//         const { user_id } = req.body;

//         // Find the order using user_id
//         const order = await Order.findOne({ user_id });

//         // If order not found, return error response
//         if (!order) {
//             return res.status(404).json({ status: false, message: "Order not found." });
//         }

//         // Find the user using user_id to retrieve email
//         const user = await User.findById(user_id);

//         // If user not found or user email not available, return error response
//         if (!user || !user.email) {
//             return res.status(404).json({ status: false, message: "User email not found." });
//         }

//         // Compose email message
//         const emailMessage = `
//             <p>Dear ${user.name},</p>
//             <p>Your order with ID ${order._id} has been confirmed.</p>
//             <p>Thank you for shopping with us.</p>
//         `;

//         // Create Nodemailer transporter
//         const transporter = nodemailer.createTransport({
//             service: 'Gmail',
//             auth: {
//                 user: "priyankdarji87@gmail.com",
//                 pass: "awyb rqkg rxiz woss",
//             },// Specify your email sending service configuration here
//         });

//         // Send email
//         await transporter.sendMail({
//             from: 'priyankdarji87@gmail.com', // Sender's email address
//             to: user.email, // Recipient's email address
//             subject: 'Order Confirmation', // Email subject
//             html: emailMessage // HTML body of the email
//         });

//         // Return success response
//         return res.status(200).json({ status: true, message: "Order confirmation email sent successfully." });
//     } catch (error) {
//         // If any error occurs, return error response
//         console.error("Error sending order confirmation email:", error);
//         return res.status(200).json({ status: false, message: "Failed to send order confirmation email." });
//     }
// }
 


exports.add_Order = async (req, res) => {
    try {
        const { address_id, order_Item, payment } = req.body;

        // Validate address_id
        if (!mongoose.isValidObjectId(address_id)) {
            return res.status(200).json({ status: false, message: "Invalid address_id!" });
        }

        // Find address associated with the user
        const address = await Address.findOne({ _id: address_id, user_id: req.user._id });

        if (!address) {
            return res.status(404).json({ status: false, message: "Address not found!" });
        }

        // Validate order items
        if (!Array.isArray(order_Item) || order_Item.length === 0) {
            return res.status(200).json({ status: false, message: "Order item(s) missing!" });
        }

        // Calculate total price and validate products
        let totalPrice = 0;
        for (const item of order_Item) {
            const { product_id, quantity } = item;

            if (!mongoose.isValidObjectId(product_id)) {
                return res.status(200).json({ status: false, message: `Invalid product_id: ${product_id}` });
            }

            if (typeof quantity !== 'number' || quantity <= 0) {
                return res.status(200).json({ status: false, message: `Invalid quantity for product_id: ${product_id}` });
            }

            const product = await Product.findById(product_id);

            if (!product) {
                return res.status(404).json({ status: false, message: `Product not found for product_id: ${product_id}` });
            }

            if (quantity > product.stock) {
                return res.status(404).json({ status: false, message: `Insufficient stock for product_id: ${product_id}` });
            }

            item.price = product.salePrice * quantity;
            totalPrice += item.price;
        }

        // Create order
        const order = new Order({
            user_id: req.user._id,
            address_id,
            order_Item,
            totalPrice,
            payment
        });

        // Save order
        const savedOrder = await order.save();

        await sendOrderConfirmationEmail(req.user._id, savedOrder);
            
        // Return success response
        return res.status(201).json({ status: true, message: "Order successfully added", order: savedOrder });
    } catch (error) {
        // Return error response
        return res.status(200).json({ status: false, message: "Error adding order", error: error.message });
    }
};

async function sendOrderConfirmationEmail(user_id, order) {
    try {

        const user = await User.findById(user_id);

        // If user not found or user email not available, return error response
        if (!user || !user.email) {
            throw new Error("User email not found.");
        }

        // Fetch product names and sale prices for order items
        const productDetails = [];
        for (const item of order.order_Item) {
            const product = await Product.findById(item.product_id);
            if (product) {
                productDetails.push({
                    name: product.name,
                    salePrice: product.salePrice,
                    quantity: item.quantity,
                    totalPrice: product.salePrice * item.quantity // Calculate total price per quantity
                });
            }
        }

        // Generate order summary HTML
        const orderItemsHTML = productDetails.map(product => `
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">${product.name}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">${product.quantity} X ${product.salePrice}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">${product.totalPrice}</td>
            </tr>
        `).join('');

        // Calculate total price
        const totalPrice = productDetails.reduce((acc, product) => acc + product.totalPrice, 0);

        // Compose email message
        const emailMessage = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Confirmation</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
                <div style="width: 90%; max-width: 600px; margin: 80px auto 0; padding: 20px; text-align: center;">
                    <div style="text-align: center;">
                        <h1 style="font-size: 24px; margin: 20px 0;">YOUR CYLO ORDER HAS DELIVERED</h1>
                        <div style="border: 1px solid #000; padding: 10px; font-size: 18px; margin-bottom: 20px;">ORDER NUMBER: ${order._id}</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 20px 0;">
                        <div style="width: 48%; font-size: 14px; text-align: left;">
                            <strong>HOW TO REACH US</strong><br><br>
                            1-894-494-8444<br>
                            harshkhokhar3536@gmail.com
                        </div>
                        <div style="width: 48%; font-size: 14px; text-align: left;">
                            <strong>LEARN ABOUT OUR</strong><br><br>
                            <a href="#">RETURN POLICY</a>
                        </div>
                    </div>
                    <div style="margin-top: 20px;">
                        <strong>ORDER SUMMARY</strong><br><br>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr>
                                    <th style="padding: 10px; border: 1px solid #ddd; text-align: left; background-color: #E4002B; color: #fff;">Product</th>
                                    <th style="padding: 10px; border: 1px solid #ddd; text-align: left; background-color: #E4002B; color: #fff;">Quantity</th>
                                    <th style="padding: 10px; border: 1px solid #ddd; text-align: left; background-color: #E4002B; color: #fff;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orderItemsHTML}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="2" style="padding: 10px; border: 1px solid #ddd; text-align: left;"><strong>Total</strong></td>
                                    <td style="padding: 10px; border: 1px solid #ddd; text-align: left;"><strong>${totalPrice}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Create Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: "2104030101141@silveroakuni.ac.in",
                pass: "dktd xfzm hgvc lqje",
            },
        });

        // Send email
        await transporter.sendMail({
            from: '2104030101141@silveroakuni.ac.in',
            to: user.email,
            subject: 'Order Confirmation',
            html: emailMessage
        });

        console.log("Order confirmation email sent successfully to:", user.email);
    } catch (error) {
        console.error("Error sending order confirmation email:", error);
        throw new Error("Failed to send order confirmation email.");
    }
}

