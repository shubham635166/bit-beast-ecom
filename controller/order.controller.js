const mongoose = require('mongoose');
const Address = require('../model/addressModel');
const Order = require('../model/order.Model'); 
const Product = require('../model/productModel');
const User = require('../model/userModel');
const nodemailer = require('nodemailer');
const Review = require('../model/reviewModel')
const Return = require('../model/returnRequestModel')

exports.add_Order = async (req, res) => {
    try {
        const { address_id, order_Item, payment, shipping_Charge, GST } = req.body;

        // Validate address_id
        if (!mongoose.isValidObjectId(address_id)) {
            return res.status(200).json({ status: false, message: "Invalid address_id!" });
        }

        // Find address associated with the user
        const address = await Address.findOne({ _id: address_id, user_id: req.user._id });

        if (!address) {
            return res.status(200).json({ status: false, message: "Address not found!" });
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
                return res.status(200).json({ status: false, message: `Product not found for product_id: ${product_id}` });
            }

            if (quantity > product.stock) {
                return res.status(200).json({ status: false, message: `Insufficient stock for product_id: ${product_id}` });
            }

            item.price = product.salePrice * quantity;
            totalPrice += item.price;
        }

        totalPrice += GST;
        totalPrice += shipping_Charge

        // Create order
        const order = new Order({
            user_id: req.user._id,
            address_id,
            order_Item,
            totalPrice,
            payment,
            GST,
            shipping_Charge
        });

        // Save order
        const savedOrder = await order.save();

        await sendOrderConfirmationEmail(req.user._id, savedOrder);

        // Return success response
        return res.status(200).json({ status: true, message: "Order successfully added", order: savedOrder });
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

    } catch (error) {
        console.error("Error sending order confirmation email:", error);
        throw new Error("Failed to send order confirmation email.");
    }
}

exports.sales_Expanse = async (req, res) => {

    const { filter } = req.body;

    try {
        if (filter === "day") {
            let dayData = [];
            for (let i = 0; i < 12; i++) {
                const startHour = new Date();
                startHour.setTime(startHour.getTime() + (5.5 * 60 * 60 * 1000));
                startHour.setHours(startHour.getHours() - i * 2);

                const endHour = new Date(startHour);
                endHour.setHours(endHour.getHours() - 2);

                const orders = await Order.find({
                    createdAt: { $gte: endHour, $lte: startHour }
                }).sort('-createdAt');

                let sales = 0;
                let expense = 0;

                orders.forEach(order => {
                    sales += order.totalPrice;
                    expense += order.shipping_Charge + order.GST;
                });

                startHour.setHours(startHour.getHours() - 5);
                startHour.setMinutes(startHour.getMinutes() - 30);
                endHour.setHours(endHour.getHours() - 5);
                endHour.setMinutes(endHour.getMinutes() - 30);

                const formattedStartHour = startHour.toLocaleString('en-US', { hour: 'numeric', hour12: true });
                const formattedEndHour = endHour.toLocaleString('en-US', { hour: 'numeric', hour12: true });
                const formattedDate = `${formattedEndHour} - ${formattedStartHour}`;

                dayData.push({
                    date: formattedDate,
                    sales,
                    expense
                });
            }

            return res.status(200).json({
                status: true,
                label: 'Day',
                data: dayData
            });
        }
        else if (filter === "week") {
            const lastWeekDate = new Date();
            lastWeekDate.setDate(lastWeekDate.getDate() - 7);
            const orders = await Order.find({ createdAt: { $gte: lastWeekDate } });
            const label = 'Week';
            const response = [];

            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const formattedDate = date.toLocaleDateString('en-US', { day: '2-digit' });
                const formattedMonth = date.toLocaleDateString('en-US', { month: 'short' });

                const dayOrders = orders.filter(order => {
                    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                    return orderDate === `${formattedMonth} ${formattedDate}`;
                });

                let sales = 0;
                let expense = 0;

                dayOrders.forEach(order => {
                    sales += order.totalPrice;
                    expense += order.shipping_Charge + order.GST;
                });

                response.push({
                    Label: `${formattedDate} ${formattedMonth}`,
                    Sales: sales,
                    Expense: expense
                });
            }

            return res.status(200).json({
                status: true,
                label,
                data: response
            });
        }
        else if (filter === "month") {
            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 7);
            const orders = await Order.find({ createdAt: { $gte: firstDayOfMonth } });
            const label = 'Month';
            const response = [];

            for (let i = 0; i < 6; i++) {
                const month = new Date(currentDate);
                month.setMonth(currentDate.getMonth() - i);
                const formattedMonth = month.toLocaleDateString('en-US', { month: 'short' });

                const monthOrders = orders.filter(order => {
                    const orderMonth = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short' });
                    return orderMonth === formattedMonth;
                });

                let sales = 0;
                let expense = 0;

                monthOrders.forEach(order => {
                    sales += order.totalPrice;
                    expense += order.shipping_Charge + order.GST;
                });

                response.push({
                    Label: formattedMonth,
                    Sales: sales,
                    Expense: expense
                });
            }

            return res.status(200).json({
                status: true,
                label,
                data: response
            });
        }
        else if (filter === "year") {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const response = [];

            for (let i = 0; i < 6; i++) {
                const year = currentYear - i;
                const orders = await Order.find({
                    createdAt: {
                        $gte: new Date(year, 0, 1),
                        $lte: new Date(year, 11, 31, 23, 59, 59)
                    }
                });

                let sales = 0;
                let expense = 0;

                orders.forEach(order => {
                    sales += order.totalPrice;
                    expense += order.shipping_Charge + order.GST;
                });

                response.push({
                    Label: year.toString(),
                    Sales: sales,
                    Expense: expense
                });
            }

            return res.status(200).json({
                status: true,
                label: 'Year',
                data: response
            });

        }
        else {
            return res.status(200).json({ status: false, message: "Invalid filter!" });
        }
    } catch (error) {
        return res.status(200).json({ status: false, message: "Server error", error: error.message });
    }
};

exports.compare_sale = async (req, res) => {
    const { filter } = req.body;

    try {
        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() + 5.5); // Convert to IST

        let response = {
            status: true,
            label: '',
            data: {
                currentPeriod: {
                    label: '',
                    sales: 0,
                    expense: 0
                },
                comparisonPeriod: {
                    label: '',
                    sales: 0,
                    expense: 0
                },
                comparison: {
                    compare: 0,
                    percentage: '0%'
                }
            }
        };

        if (filter === "month") {
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();

            const startCurrentPeriod = new Date(currentYear, currentMonth - 5, 1);
            startCurrentPeriod.setHours(5.5, 0, 0, 0); // Start of the day in IST
            const endCurrentPeriod = new Date(currentYear, currentMonth + 1, 0);
            endCurrentPeriod.setHours(23.5, 59, 59, 999); // End of the day in IST

            const startComparisonPeriod = new Date(currentYear, currentMonth - 11, 1);
            startComparisonPeriod.setHours(5.5, 0, 0, 0); // Start of the day in IST
            const endComparisonPeriod = new Date(currentYear, currentMonth - 5, 0);
            endComparisonPeriod.setHours(23.5, 59, 59, 999); // End of the day in IST

            const currentOrders = await Order.find({
                createdAt: { $gte: startCurrentPeriod, $lte: endCurrentPeriod }
            });

            const comparisonOrders = await Order.find({
                createdAt: { $gte: startComparisonPeriod, $lte: endComparisonPeriod }
            });

            let currentPeriodSales = 0;
            let currentExpense = 0;
            let comparisonPeriodSales = 0;
            let comparisonExpense = 0;

            currentOrders.forEach(order => {
                currentPeriodSales += order.totalPrice;
                currentExpense += order.GST + order.shipping_Charge;
            });

            comparisonOrders.forEach(order => {
                comparisonPeriodSales += order.totalPrice;
                comparisonExpense += order.GST + order.shipping_Charge;
            });

            const salesDifference = currentPeriodSales - comparisonPeriodSales;
            const salesPercentageChange = comparisonPeriodSales === 0
                ? (currentPeriodSales === 0 ? '0%' : '100%')
                : ((salesDifference / comparisonPeriodSales) * 100).toFixed(2) + '%';

            response.label = 'Month';
            response.data.currentPeriod.label = `${endCurrentPeriod.toLocaleString('en-IN', { month: 'short' })}-${startCurrentPeriod.toLocaleString('en-IN', { month: 'short' })}`;
            response.data.currentPeriod.sales = currentPeriodSales;
            response.data.currentPeriod.expense = currentExpense;
            response.data.comparisonPeriod.label = `${endComparisonPeriod.toLocaleString('en-IN', { month: 'short' })}-${startComparisonPeriod.toLocaleString('en-IN', { month: 'short' })}`;
            response.data.comparisonPeriod.sales = comparisonPeriodSales;
            response.data.comparisonPeriod.expense = comparisonExpense;
            response.data.comparison.compare = salesDifference;
            response.data.comparison.percentage = salesPercentageChange;

            return res.status(200).json(response);
        } 
        else if (filter === "year") {
            const currentYear = currentDate.getFullYear();

            const startCurrentPeriod = new Date(currentDate);
            startCurrentPeriod.setFullYear(currentYear - 1);
            startCurrentPeriod.setHours(5.5, 0, 0, 0); // Start of the day in IST

            const endCurrentPeriod = new Date(currentDate);
            endCurrentPeriod.setHours(23.5, 59, 59, 999); // End of the day in IST

            const startComparisonPeriod = new Date(startCurrentPeriod);
            startComparisonPeriod.setFullYear(startComparisonPeriod.getFullYear() - 1);
            startComparisonPeriod.setHours(5.5, 0, 0, 0); // Start of the day in IST

            const endComparisonPeriod = new Date(startCurrentPeriod);
            endComparisonPeriod.setHours(23.5, 59, 59, 999); // End of the day in IST

            const currentOrders = await Order.find({
                createdAt: { $gte: startCurrentPeriod, $lte: endCurrentPeriod }
            });

            const comparisonOrders = await Order.find({
                createdAt: { $gte: startComparisonPeriod, $lte: endComparisonPeriod }
            });

            let currentPeriodSales = 0;
            let currentExpense = 0;
            let comparisonPeriodSales = 0;
            let comparisonExpense = 0;

            currentOrders.forEach(order => {
                currentPeriodSales += order.totalPrice;
                currentExpense += order.GST + order.shipping_Charge;
            });

            comparisonOrders.forEach(order => {
                comparisonPeriodSales += order.totalPrice;
                comparisonExpense += order.GST + order.shipping_Charge;
            });

            const salesDifference = currentPeriodSales - comparisonPeriodSales;
            const salesPercentageChange = comparisonPeriodSales === 0
                ? (currentPeriodSales === 0 ? '0%' : '100%')
                : ((salesDifference / comparisonPeriodSales) * 100).toFixed(2) + '%';

            response.label = 'Year';
            response.data.currentPeriod.label = `${endCurrentPeriod.getFullYear()}`;
            response.data.currentPeriod.sales = currentPeriodSales;
            response.data.currentPeriod.expense = currentExpense;
            response.data.comparisonPeriod.label = `${endComparisonPeriod.getFullYear()}`;
            response.data.comparisonPeriod.sales = comparisonPeriodSales;
            response.data.comparisonPeriod.expense = comparisonExpense;
            response.data.comparison.compare = salesDifference;
            response.data.comparison.percentage = salesPercentageChange;

            return res.status(200).json(response);
        } 
        else if (filter === "week") {
            const endCurrentPeriod = new Date(currentDate);
            endCurrentPeriod.setHours(23, 59, 59, 999); // End of the day in IST
            const startCurrentPeriod = new Date(endCurrentPeriod);
            startCurrentPeriod.setDate(startCurrentPeriod.getDate() - 6); // Start of the week
            startCurrentPeriod.setHours(0, 0, 0, 0); // Start of the day in IST

            const endComparisonPeriod = new Date(startCurrentPeriod);
            endComparisonPeriod.setDate(endComparisonPeriod.getDate() - 1); // End of the previous week
            endComparisonPeriod.setHours(23, 59, 59, 999); // End of the day in IST
            const startComparisonPeriod = new Date(endComparisonPeriod);
            startComparisonPeriod.setDate(startComparisonPeriod.getDate() - 6); // Start of the previous week
            startComparisonPeriod.setHours(0, 0, 0, 0); // Start of the day in IST

            const currentOrders = await Order.find({
                createdAt: { $gte: startCurrentPeriod, $lte: endCurrentPeriod }
            });

            const comparisonOrders = await Order.find({
                createdAt: { $gte: startComparisonPeriod, $lte: endComparisonPeriod }
            });

            let currentPeriodSales = 0;
            let currentExpense = 0;
            let comparisonPeriodSales = 0;
            let comparisonExpense = 0;

            currentOrders.forEach(order => {
                currentPeriodSales += order.totalPrice;
                currentExpense += order.GST + order.shipping_Charge;
            });

            comparisonOrders.forEach(order => {
                comparisonPeriodSales += order.totalPrice;
                comparisonExpense += order.GST + order.shipping_Charge;
            });

            const salesDifference = currentPeriodSales - comparisonPeriodSales;
            const salesPercentageChange = comparisonPeriodSales === 0
                ? (currentPeriodSales === 0 ? '0%' : '100%')
                : ((salesDifference / comparisonPeriodSales) * 100).toFixed(2) + '%';

            const dayFormat = { weekday: 'short' };
            const currentStartDayLabel = startCurrentPeriod.toLocaleString('en-IN', dayFormat);
            const currentEndDayLabel = endCurrentPeriod.toLocaleString('en-IN', dayFormat);
            const comparisonStartDayLabel = startComparisonPeriod.toLocaleString('en-IN', dayFormat);
            const comparisonEndDayLabel = endComparisonPeriod.toLocaleString('en-IN', dayFormat);

            response.label = 'Week';
            response.data.currentPeriod.label = `${currentEndDayLabel}-${currentStartDayLabel}`;
            response.data.currentPeriod.sales = currentPeriodSales;
            response.data.currentPeriod.expense = currentExpense;
            response.data.comparisonPeriod.label = `${comparisonEndDayLabel}-${comparisonStartDayLabel}`;
            response.data.comparisonPeriod.sales = comparisonPeriodSales;
            response.data.comparisonPeriod.expense = comparisonExpense;
            response.data.comparison.compare = salesDifference;
            response.data.comparison.percentage = salesPercentageChange;

            return res.status(200).json(response);
        } else {
            return res.status(200).json({ status: false, message: "Invalid filter!" });
        }
    } catch (error) {
        return res.status(200).json({ status: false, message: "Server error", error: error.message });
    }
};

exports.findOrderReviewProduct = async (req, res) => {
    try {
        // Fetch all reviews made by the user
        const reviews = await Review.find({ user_id: req.user._id });

        // Fetch all orders made by the user
        const orderProducts = await Order.find({ user_id: req.user._id }).populate('order_Item.product_id');

        // Initialize an empty array to hold the products with their review status
        let reviewedCartProducts = [];

        // Loop through each order
        orderProducts.forEach(orderItem => {
            // Loop through each product in the order
            const reviewedProducts = orderItem.order_Item.map(product => {
                // Check if a review exists for the current product
                const reviewExists = reviews.some(review => 
                    review.product_id && review.product_id.toString() === product.product_id.toString()
                );

                // Return the product with its review status
                return { 
                    ...product.toObject(),
                    reviewed: reviewExists
                };
            });

            // Add the reviewed products to the array
            reviewedCartProducts.push(...reviewedProducts);
        });

        // Send the response with the reviewed cart products
        res.status(200).json({ status: true, reviewedCartProducts });
    } catch (error) {
        res.status(200).json({ error: error.message });
    }
};

exports.preViewOrder = async (req, res) => {
    try {
        const { order_id } = req.body;

        if (!mongoose.isValidObjectId(order_id)) {
            return res.status(200).json({ status: false, message: "Invalid order_id!" });
        }

        const order = await Order.findOne({ _id: order_id, user_id: req.user._id });

        if (!order) {
            return res.status(200).json({ status: false, message: "Order not found!" });
        }

        const reviews = await Review.find({ order_id: order._id, user_id: req.user._id });
        const productReturn = await Return.find({ order_id: order._id, user_id: req.user._id });

        const orderWithReviews = order.order_Item.map(item => {

            const isOrderReturn = productReturn.some(returnReq => returnReq.type === 'order');

            const review = reviews.find(review => review.product_id.toString() === item.product_id.toString());
            
            const returnRequest = isOrderReturn ? true : productReturn.some(returnReq => returnReq.order_item_id.toString() === item.product_id.toString());

            return {
                ...item.toObject(),
                review: review ? true : false,
                returnRequest: returnRequest
            };
        });

        return res.status(200).json({ status: true, order: { ...order.toObject(), order_Item: orderWithReviews } });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "An error occurred while processing your request." });
    }
};