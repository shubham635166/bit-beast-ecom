const Task = require("../model/productOneModel");
exports.task = async (req, res) => {
    const { color, size, quantity } = req.body;
    let price = 0;

    const priceMap = {
        red: 100,
        blue: 110,
        pink: 125,
        white: 150
    };

    if (priceMap[color]) {
        price += priceMap[color];

        const sizeMultiplier = {
            s: 0.9,
            m: 1,
            l: 1.1,
            xl: 1.2,
            xxl: 1.3
        };

        if (sizeMultiplier[size]) {
            price *= sizeMultiplier[size];
            switch (quantity) {
                case 1:
                    break;
                case 10:
                    price *= 0.9;
                    break;
                case 25:
                    price *= 0.8;
                    break;
                case 50:
                    price *= 0.7;
                    break;
                case 100:
                    price *= 0.6;
                    break;
                default:
                    price = 0;
            }
        } else {
            price = 0;
        }
    } else {
        price = 200;
    }

    const data = new Task({
        color,
        size,
        price: Math.round(price * quantity),
        quantity
    });

    if (data) {
        await data.save();
        return res.status(200).json({ status: true, message: "Data Added Successfully", data: data });
    } else {
        return res.status(404).json({ status: true, message: "Data Not Added" });
    }
};
