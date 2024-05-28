const { default: mongoose } = require('mongoose')
const Cart = require('../model/cart')
const Product = require('../model/productModel');
const Coupon = require('../model/couponModel');
const Review = require('../model/reviewModel');
const User = require('../model/userModel');
const Return = require('../model/returnRequestModel')

// exports.cartAdd = async (req, res) => {
//     const { product_id, variation_id, quantity } = req.body
//     const user_id = req.user._id;
//     const user = await User.findOne({ _id: user_id });

//     if (user.type === "user") {
//         const cart = await Cart.findOne({ user_id });

//     if (cart) {

//         const findIndex = cart.products.findIndex(product => product.product_id.toString() === product_id);
//         //update simple product quantity
//         if (findIndex > -1) {
//             if (mongoose.isValidObjectId(product_id)) {
//                 const product = await Product.findOne({ _id: product_id })
//                 if (product) {
//                     if (product.type === "simple") {
//                         if (product.stock >= quantity) {
//                             cart.products[findIndex].productTotalPrice = product.salePrice * quantity;
//                             cart.products[findIndex].quantity = quantity;
//                             cart.updatedAt = new Date()
//                             let total = 0
//                             for (const product of cart.products) {
//                                 total += product.productTotalPrice;
//                             }
//                             cart.totalPrice = total
//                             await cart.save();
//                             res.status(200).send({ status: true, message: "Simple Product updated successfully in cart" });

//                         } else {
//                             res.status(200).send({ status: false, message: "stock not available" })
//                         }
//                     } else {
//                         //update variation product
//                         if (product.type === "variation") {
//                             const variationProduct = await product.variation.find(variation => variation._id.toString() === variation_id)


//                             if (variationProduct) {

//                                 if (variationProduct.stock >= quantity) {

//                                     cart.products[findIndex].productTotalPrice = variationProduct.salePrice * quantity;
//                                     cart.products[findIndex].quantity = quantity;
//                                     cart.updatedAt = new Date()

//                                     let total = 0
//                                     for (const product of cart.products) {
//                                         total += product.productTotalPrice;
//                                     }
//                                     cart.totalPrice = total
//                                     await cart.save();
//                                     res.status(200).send({ status: true, message: "Variation Product updated successfully in cart" });

//                                 } else {
//                                     res.status(200).send({ status: false, message: "stock not available" })
//                                 }
//                             }
//                             else {
//                                 res.status(200).send({ status: false, message: "product not found" })
//                             }
//                         }
//                         else {
//                             res.status(200).send({ status: false, message: "this is not variation product" })
//                         }
//                     }
//                 } else {
//                     res.status(200).send({ status: false, message: "product not found" })
//                 }
//             }
//             else {
//                 res.status(200).send({ status: false, message: "Please Enter valid id" })
//             }
//         } else {
//             // add cart in simple product
//             if (mongoose.isValidObjectId(product_id)) {
//                 const product = await Product.findOne({ _id: product_id })
//                 if (product) {
//                     if (product.type === "simple") {
//                         if (product.stock >= quantity) {
//                             cart.products.push({ product_id, quantity, productTotalPrice: product.salePrice * quantity }),
//                             cart.updatedAt = new Date()

//                             let total = 0
//                             for (const product of cart.products) {
//                                 total += product.productTotalPrice;
//                             }
//                             cart.totalPrice = total
//                             await cart.save()
//                             res.status(200).send({ status: true, message: "simple product add successfully in cart" })
//                         } else {
//                             res.status(200).send({ status: false, message: "stock not available" })
//                         }
//                     } else {
//                         //add cart in variation product
//                         if (product.type === "variation") {
//                             const variationProduct = await product.variation.find(variation => variation._id.toString() === variation_id)


//                             if (variationProduct) {
//                                 if (variationProduct.stock >= quantity) {
//                                     cart.products.push({ product_id, variation_id, quantity, productTotalPrice: variationProduct.salePrice * quantity }),
//                                                                 cart.updatedAt = new Date()

//                                     let total = 0;
//                                     for (const product of cart.products) {
//                                         total += product.productTotalPrice;
//                                     }
//                                     cart.totalPrice = total
//                                     await cart.save()
//                                     res.status(200).send({ status: true, message: "variation product add successfully in cart" })
//                                 } else {
//                                     res.status(200).send({ status: false, message: "stock not available" })
//                                 }
//                             } else {
//                                 res.status(200).send({ status: false, message: "product not found" })
//                             }

//                         } else {
//                             res.status(200).send({ status: false, message: "this is not variation product" })
//                         }
//                     }
//                 } else {
//                     res.status(200).send({ status: false, message: "product not found" })
//                 }
//             } else {
//                 res.status(200).send({ status: false, message: "Please Enter valid id" })
//             }
//         }

//     } else {
//         // new user add new cart

//         if (mongoose.isValidObjectId(product_id)) {
//             const product = await Product.findOne({ _id: product_id })
//             if (product) {

//                 if (product.type === "simple") {
//                     if (product.stock >= quantity) {
//                         const cart = Cart({
//                             user_id: req.user._id,
//                             products: [{ product_id, quantity, productTotalPrice: product.salePrice * quantity}] , 
//                         })
//                         let total = 0;
//                         for (const product of cart.products) {
//                             total += product.productTotalPrice;
//                         }
//                         cart.totalPrice = total
//                         await cart.save()
//                         res.status(200).send({ status: true, message: "simple product add successfully in cart" })
//                     } else {
//                         res.status(200).send({ status: false, message: "stock not available" })
//                     }
//                 } else {
//                     if (product.type === "variation") {
//                         const variationProduct = await product.variation.find(variation => variation._id.toString() === variation_id)
//                         if (variationProduct) {

//                             if (variationProduct.stock >= quantity) {
//                                 const cart = Cart({
//                                     user_id: req.user._id,
//                                     products: [{ product_id, quantity, variation_id, productTotalPrice: variationProduct.salePrice * quantity }],
//                                 })
//                                 let total = 0;
//                                 for (const product of cart.products) {
//                                     total += product.productTotalPrice;
//                                 }
//                                 cart.totalPrice = total
//                                 await cart.save()
//                                 res.status(200).send({ status: true, message: "variation product add successfully in cart" })
//                             } else {
//                                 res.status(200).send({ status: false, message: "stock not available" })
//                             }
//                         } else {
//                             res.status(200).send({ status: false, message: "product not found" })
//                         }

//                     } else {
//                         res.status(200).send({ status: false, message: "this is not variation product" })
//                     }
//                 }
//             } else {
//                 res.status(200).send({ status: false, message: "product not found" })
//             }
//         } else {
//             res.status(200).send({ status: false, message: "Please Enter valid id" })
//         }

//     }
//     }else{
//         return res.status(200).send({ status: false, message: "user not login" });
//     }
// }

exports.cartAdd = async (req, res) => {
    try {

    const { product_id, variation_id, quantity } = req.body;

    const validation = ["product_id", "quantity" ]

        for (let i = 0; i < validation.length; i++) {
                const fieldName = validation[i];
                
                if (!req.body[fieldName]) {
                return res.status(200).json({ status: false, message: `${fieldName} is required!` });
                }
        }

    const user_id = req.user._id;
    const user = await User.findOne({ _id: user_id });

    if (!user || user.type !== "user") {
        return res.status(200).send({ status: false, message: "user not login" });
    }

    const cart = await Cart.findOne({ user_id });

    if (!cart) {
        // New user adds new cart
        if (!mongoose.isValidObjectId(product_id)) {
            return res.status(200).send({ status: false, message: "Please Enter valid id" });
        }

        const product = await Product.findOne({ _id: product_id });

        if (!product) {
            return res.status(200).send({ status: false, message: "product not found" });
        }

        if (product.type === "simple") {
            if (product.stock < quantity) {
                return res.status(200).send({ status: false, message: "stock not available" });
            }

            const cart = Cart({
                user_id: req.user._id,
                products: [{ product_id, quantity, productTotalPrice: product.salePrice * quantity }],
            });

            let total = 0;
            for (const product of cart.products) {
                total += product.productTotalPrice;
            }
            cart.totalPrice = total;
            await cart.save();
            return res.status(200).send({ status: true, message: "simple product add successfully in cart" });
        } else if (product.type === "variation") {
            const variationProduct = await product.variation.find(variation => variation._id.toString() === variation_id);
            if (!variationProduct) {
                return res.status(200).send({ status: false, message: "product not found" });
            }

            if (variationProduct.stock < quantity) {
                return res.status(200).send({ status: false, message: "stock not available" });
            }

            const cart = Cart({
                user_id: req.user._id,
                products: [{ product_id, quantity, variation_id, productTotalPrice: variationProduct.salePrice * quantity }],
            });

            let total = 0;
            for (const product of cart.products) {
                total += product.productTotalPrice;
            }
            cart.totalPrice = total;
            await cart.save();
            return res.status(200).send({ status: true, message: "variation product add successfully in cart" });
        } else {
            return res.status(200).send({ status: false, message: "this is not variation product" });
        }
    } else {
        const findIndex = cart.products.findIndex(product => product.product_id.toString() === product_id);

        if (findIndex > -1) {
            if (!mongoose.isValidObjectId(product_id)) {
                return res.status(200).send({ status: false, message: "Please Enter valid id" });
            }

            const product = await Product.findOne({ _id: product_id });

            if (!product) {
                return res.status(200).send({ status: false, message: "product not found" });
            }

            if (product.type === "simple") {
                if (product.stock < quantity) {
                    return res.status(200).send({ status: false, message: "stock not available" });
                }

                cart.products[findIndex].productTotalPrice = product.salePrice * quantity;
                cart.products[findIndex].quantity = quantity;
                cart.products[findIndex].updatedAt = new Date();

                let total = 0;
                for (const product of cart.products) {
                    total += product.productTotalPrice;
                }
                cart.totalPrice = total;
                await cart.save();
                return res.status(200).send({ status: true, message: "Simple Product updated successfully in cart" });
            } else if (product.type === "variation") {
                const variationProduct = await product.variation.find(variation => variation._id.toString() === variation_id);

                if (!variationProduct) {
                    return res.status(200).send({ status: false, message: "product not found" });
                }

                if (variationProduct.stock < quantity) {
                    return res.status(200).send({ status: false, message: "stock not available" });
                }

                cart.products[findIndex].productTotalPrice = variationProduct.salePrice * quantity;
                cart.products[findIndex].quantity = quantity;
                cart.products[findIndex].updatedAt = new Date();

                let total = 0;
                for (const product of cart.products) {
                    total += product.productTotalPrice;
                }
                cart.totalPrice = total;
                await cart.save();
                return res.status(200).send({ status: true, message: "Variation Product updated successfully in cart" });
            } else {
                return res.status(200).send({ status: false, message: "this is not variation product" });
            }
        } else {
            // Add cart in simple product
            if (!mongoose.isValidObjectId(product_id)) {
                return res.status(200).send({ status: false, message: "Please Enter valid id" });
            }

            const product = await Product.findOne({ _id: product_id });

            if (!product) {
                return res.status(200).send({ status: false, message: "product not found" });
            }

            if (product.type === "simple") {
                if (product.stock < quantity) {
                    return res.status(200).send({ status: false, message: "stock not available" });
                }

                cart.products.push({ product_id, quantity, productTotalPrice: product.salePrice * quantity });
                cart.updatedAt = new Date();

                let total = 0;
                for (const product of cart.products) {
                    total += product.productTotalPrice;
                }
                cart.totalPrice = total;
                await cart.save();
                return res.status(200).send({ status: true, message: "simple product add successfully in cart" });
            } else if (product.type === "variation") {
                const variationProduct = await product.variation.find(variation => variation._id.toString() === variation_id);

                if (!variationProduct) {
                    return res.status(200).send({ status: false, message: "product not found" });
                }

                if (variationProduct.stock < quantity) {
                    return res.status(200).send({ status: false, message: "stock not available" });
                }

                cart.products.push({ product_id, variation_id, quantity, productTotalPrice: variationProduct.salePrice * quantity });
                cart.updatedAt = new Date();

                let total = 0;
                for (const product of cart.products) {
                    total += product.productTotalPrice;
                }
                cart.totalPrice = total;
                await cart.save();
                return res.status(200).send({ status: true, message: "variation product add successfully in cart" });
            } else {
                return res.status(200).send({ status: false, message: "this is not variation product" });
            }
        }
    }
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}

};

exports.getCart = async (req, res) => {
    try {

    const user_id = req.user._id
    const cart = await Cart.find({ user_id: user_id }).populate('products.product_id').populate('user_id')
    res.status(200).json({ status: true, product: cart.length, cart: cart })
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}

}

exports.removeCart = async (req, res) => {
    try {

    const { cart_id } = req.body

    if (!cart_id) {
        return res.status(200).json({status:false , message : "cart_id is required!"})
    }

    if (mongoose.isValidObjectId(cart_id)) {
        await Cart.findByIdAndDelete({ user_id : req.user_id ,_id: cart_id })
        res.status(200).send({ status: true, message: "cart successfully deleted" })
    } else {
        res.status(200).send({ status: false, message: "Please enter valid cart id" })
    }
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}

}

exports.removeCartProduct = async (req, res) => {
    try {

    const { cart_id, product_id } = req.body

    if (!cart_id) {
        return res.status(200).json({status:false , message : "cart_id is required!"})
    }

    if (!product_id) {
        return res.status(200).json({status:false , message : "product_id is required!"})
    }

    if (mongoose.isValidObjectId(cart_id)) {
        const cart = await Cart.findOne({user_id : req.user_id, _id: cart_id })
        if (cart) {
            const productIndex = cart.products.findIndex(product => product.product_id.equals(product_id));
            if (productIndex !== -1) {
                cart.products.splice(productIndex, 1)
                await cart.save()
                res.status(200).send({ status: true, message: "product successfully deleted" })
            } else {
                res.status(200).send({ status: false, message: "product not found" })
            }
        } else {
            res.status(200).send({ status: false, message: "cart not found" })
        }
    } else {
        res.status(200).send({ status: false, message: "Id is not valid" })
    }
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}

}

exports.applyCoupon = async (req, res) => {
    try {

    const { couponCode } = req.body

    if (!couponCode) {
        return res.status(200).json({status:false , message : "couponCode is required!"})
    }

    const user = await Cart.findOne({ user_id: req.user._id }).populate('products.product_id')

    if (user) {
        if (couponCode) {

            const coupon = await Coupon.findOne({ couponCode: couponCode })

            if (coupon) {
                if (user.coupon_id == null) {
                    if (coupon.couponCode === couponCode) {
                        if (new Date() <= coupon.expiryDate) {

                            if (user.totalPrice >= coupon.minSpend) {
                                if (user.totalPrice <= coupon.maxSpend) {

                                    const discountPrice = user.totalPrice * (coupon.amount / 100)
                                    const finalPrice = user.totalPrice - discountPrice;

                                    user.coupon_id = coupon._id
                                    await user.save();

                                    res.status(200).send({ status: true, message: "Successfully applied coupon", totalPrice: user.totalPrice, Discount: `${coupon.amount}%`, lessAmount: discountPrice, finalPrice: finalPrice })

                                } else {
                                    res.status(200).send({ status: false, message: "product not maximum spend" })
                                }
                            } else {
                                res.status(200).send({ status: false, message: "product not minimum spend" })
                            }
                        } else {
                            res.status(200).send({ status: false, message: "Coupon expired...." })
                        }
                    } else {
                        res.status(200).send({ status: false, message: "please enter valid coupon" })
                    }
                } else {
                    res.status(200).send({ status: false, message: "coupon already used" })
                }
            }
            else {
                res.status(200).send({ status: false, message: "coupon not found" })
            }
        } else {
            res.status(200).send({ status: false, message: "Please Enter Coupon" })
        }
    } else {
        res.status(200).send({ status: false, message: "please add cart in product" })
    }
}
catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
}

}

exports.findReviewProduct = async (req, res) => {
    try {
        const reviews = await Review.find({ user_id: req.user._id });
        const cartProducts = await Cart.find({ user_id: req.user._id });
        const returnRequests = await Return.find({ user_id: req.user._id });

        // Initialize an empty cart object
        let reviewedCartProducts = {};

        // Loop through each cart item
        cartProducts.forEach(cartItem => {
            const reviewedProducts = cartItem.products.map(product => {
                const reviewExists = reviews.some(review => review.product_id.toString() === product.product_id.toString());

                const returnRequest = returnRequests.find(request => request.order_item_id && request.order_item_id.toString() === product._id.toString());
                const returnProduct = returnRequest ? true : false;

                return {
                    ...product.toObject(),
                    reviewed: reviewExists,
                    returnProductRequest: returnProduct
                };
            });

            // Add the reviewed products to the cart object
            reviewedCartProducts = {
                ...reviewedCartProducts,
                cart_item: reviewedProducts
            };
        });

        // Send the response with the reviewed cart
        res.status(200).json({ status: true, reviewedCartProducts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};