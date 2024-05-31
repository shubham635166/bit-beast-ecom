const mongoose = require('mongoose')
const Product = require('../model/productModel')
const Review = require('../model/reviewModel')
const ProductCategory = require('../model/productCategory')
const ImgUrl = require('../model/imgModel')
const Brand = require('../model/brandModel')
const jwt = require('jsonwebtoken');
const key = require('../middleware/secreteKey');
const wishList = require('../model/wishListModel')

// product

exports.product = async (req, res) => {
    try {

        const { name, regularPrice, salePrice, description, img_id, category_id, slug, sku, isPublished, isFeatured, isDisable, isDeleted, stock, type, brand_id } = req.body


        const validation = ["name", "regularPrice", "salePrice", "description", "img_id", "category_id", "slug", "sku", "isPublished", "isFeatured", "stock", "type", "brand_id"]

        for (let i = 0; i < validation.length; i++) {
            for (let i = 0; i < validation.length; i++) {
                const fieldName = validation[i];

                if (!req.body[fieldName]) {
                    return res.status(200).json({ status: false, message: `${fieldName} is required!` });
                }
            }
        }

        const modifiedSlug = slug.replace(/\s+/g, '-');

        let variation = null

        if (type === "simple") {
            if (!req.body.variation) {
                variation = null
            } else {
                return res.status(200).json({ status: false, message: "Please remove variation!" });
            }
        }

        else if (type === "variation") {
            if (!req.body.variation) {
                return res.status(200).json({ status: false, message: "Please add variation!" });
            }
            const variations = req.body.variation;
            for (let i = 0; i < variations.length; i++) {
                const variation = variations[i];
                const variationValidation = ["variant", "sku", "regularPrice", "salePrice", "stock", "isPublished", "description", "title", "slug"];

                for (let j = 0; j < variationValidation.length; j++) {
                    const fieldName = variationValidation[j];
                    if (!variation[fieldName]) {
                        return res.status(200).json({ status: false, message: `${fieldName} is required for variation!` });
                    }
                }

                // Adjust variation's slug to match the structure of the product's slug
                variation.slug = `${modifiedSlug}-${variation.variant.replace(/\s+/g, '-')}`;

                if (variation.regularPrice < variation.salePrice) {
                    return res.status(200).json({ status: false, message: "Regular price must be greater than sale price in variation!" });
                }

            }
            variation = req.body.variation;
        } else {
            return res.status(200).json({ status: false, message: "Invalid type!" });
        }

        if (!mongoose.isValidObjectId(category_id)) {
            return res.status(200).json({ status: false, message: "Invalid category_id!" });
        }

        if (!mongoose.isValidObjectId(img_id)) {
            return res.status(200).json({ status: false, message: "Invalid img_id!" });
        }

        if (!mongoose.isValidObjectId(brand_id)) {
            return res.status(200).json({ status: false, message: "Invalid brand_id!" });
        }

        if (regularPrice < salePrice) {
            return res.status(200).json({ status: false, message: "Regular price must be greater than sale price!" });
        }

        const category = await ProductCategory.findOne({ _id: category_id })

        if (!category) {
            return res.status(200).json({ status: false, message: "category not found!" });
        }

        const img = await ImgUrl.findOne({ _id: img_id })

        if (!img) {
            return res.status(200).json({ status: false, message: "img not found!" })
        }

        const brand = await Brand.findOne({ _id: brand_id })

        if (!brand) {
            return res.status(200).json({ status: false, message: "brand not found!" })
        }

        const dis = regularPrice - salePrice

        const product = await Product({
            name,
            regularPrice,
            description,
            salePrice,
            discount: Math.round(dis / regularPrice * 100),
            img_id,
            category_id,
            slug: modifiedSlug,
            sku,
            variation,
            isPublished,
            isFeatured,
            isDisable,
            isDeleted,
            stock,
            type,
            brand_id
        })

        await product.save()

        if (product) {
            return res.status(200).json({ status: true, message: "Product Added", product: product });
        } else {
            return res.status(200).json({ status: false, message: "not add!" });
        }

    }
    catch (error) {
        return res.status(200).json({ status: false, message: "Internal Server Error" });
    }
}

exports.productUpdate = async (req, res) => {
    try {

        const { name, variation, product_id, regularPrice, salePrice, description, img_id, category_id, slug, sku, isPublished, isFeatured, isDisable, isDeleted, stock, brand_id } = req.body;

        if (!product_id) {
            return res.status(200).json({ status: false, message: "product id required!" })
        }

        if (mongoose.isValidObjectId(product_id)) {

            const product = await Product.findOne({ _id: product_id });


            if (category_id && !mongoose.isValidObjectId(category_id)) {
                return res.status(200).json({ status: false, message: "Invalid category_id!" });
            }

            if (img_id && !mongoose.isValidObjectId(img_id)) {
                return res.status(200).json({ status: false, message: "Invalid img_id!" });
            }

            if (brand_id && !mongoose.isValidObjectId(brand_id)) {
                return res.status(200).json({ status: false, message: "Invalid brand_id!" });
            }

            if (regularPrice < salePrice) {
                return res.status(200).json({ status: false, message: "Regular price must be greater than sale price!" });
            }

            const category = await ProductCategory.findOne({ _id: category_id });

            if (category_id && !category) {
                return res.status(200).json({ status: false, message: "category not found!" });
            }

            const img = await ImgUrl.findOne({ _id: img_id });

            if (img_id && !img) {
                return res.status(200).json({ status: false, message: "img not found!" });
            }

            const brand = await Brand.findOne({ _id: brand_id });

            if (brand_id && !brand) {
                return res.status(200).json({ status: false, message: "brand not found!" });
            }


            if (product && product.isDeleted === false) {
                let discount;

                if (regularPrice && salePrice) {
                    discount = Math.round((regularPrice - salePrice) / regularPrice * 100);
                } else {
                    discount = product.discount;
                }

                if (name) {
                    product.name = name;
                }

                if (regularPrice) {
                    product.regularPrice = regularPrice;
                }

                if (salePrice) {
                    product.salePrice = salePrice;
                }

                if (description) {
                    product.description = description;
                }

                product.discount = discount;

                if (img_id) {
                    product.img_id = img_id;
                }

                if (category_id) {
                    product.category_id = category_id;
                }

                if (slug) {
                    const modifiedSlug = slug ? slug.replace(/\s+/g, '-') : product.slug;
                    product.slug = modifiedSlug;
                }

                if (sku) {
                    product.sku = sku;
                }

                if (isPublished !== undefined) {
                    product.isPublished = isPublished;
                }

                if (isFeatured !== undefined) {
                    product.isFeatured = isFeatured;
                }

                if (isDisable !== undefined) {
                    product.isDisable = isDisable;
                }

                if (isDeleted !== undefined) {
                    product.isDeleted = isDeleted;
                }

                if (stock !== undefined) {
                    product.stock = stock;
                }

                if (brand_id) {
                    product.brand_id = brand_id;
                }

                product.updatedAt = new Date();

                await product.save();

                return res.status(200).json({ status: true, message: "product update successfully", product: product });

            } else {
                return res.status(200).json({ status: false, message: "product not found!" });
            }
        } else {
            return res.status(200).json({ status: false, message: "Invalid product id!" });
        }
    } catch (error) {
        // Log the error
        console.error(error);
        // Send a generic error response
        return res.status(200).json({ status: false, message: "An error occurred while updating the product." });
    }
}

exports.productDelete = async (req, res) => {
    const { product_id } = req.body

    if (!product_id) {
        return res.status(200).json({ status: false, message: "product_id is required!" })
    }

    if (mongoose.isValidObjectId(product_id)) {
        const product = await Product.findOne({ _id: product_id })

        if (!product) {
            res.status(200).json({ status: false, message: "product not found" });
        }

        if (product.isDeleted == false) {
            product.isDeleted = true;
            await product.save();
            res.status(200).send({ status: true, message: "product delete successfully" });
        }
        else {
            res.status(200).json({ status: true, message: "product not found" });
        }

    } else {
        res.status(200).json({ status: false, message: "Invalid product id!" });
    }
}

exports.allDelete = async (req, res) => {
    const product = await Product.find()
    for (let i = 0; i < product.length; i++) {
        if (product[i].isDeleted === false) {
            product[i].isDeleted = true
            await product[i].save()
            res.status(200).send({ status: true, message: "all product successfully deleted" })
        } else {
            res.status(200).send({ status: false, message: "product not found" })
        }
    }
}

exports.multipleDelete = async (req, res) => {
    const { product_id } = req.body;
    if (!product_id) {
        return res.status(200).json({ status: false, message: "product_id is required!" })
    }
    const query = "";

    for (let i = 0; i < product_id.length; i++) {
        if (mongoose.isValidObjectId(product_id[i])) {
            const product = await Product.findOne({ _id: product_id[i] });
            if (product) {
                if (product.isDeleted == false) {
                    product.isDeleted = true;
                    await product.save();
                } else {
                    return query.push = res.status(200).json({ status: false, message: `Product ${product_id[i]} is already deleted` });
                }
            } else {
                return query.push = res.status(200).send({ status: false, message: `Product ${product_id[i]} not found` });
            }
        } else {
            return query.push = res.status(200).send({ status: false, message: `Invalid product id: ${product_id[i]}` })
        }
    }

    if (query == "") {
        res.status(200).send({ status: true, message: "All Products Successfully deleted" });
    } else {
        res.status(200).send({ status: false, error: query });
    }
};

exports.productGet = async (req, res) => {
    try {
        const { type, startingPrice, endingPrice, category_id, isDeleted, brand_id, name } = req.body;

        let user_id = null

        if (req.headers.cookie) {
            const token = req.headers.cookie;

            const tokenParts = token.split(';').find(part => part.trim().startsWith('token='));

            const tokenValue = tokenParts.trim().substring(6);

            const decodedData = jwt.verify(tokenValue, key.key);
            user_id = decodedData.id;

        }

        let matchStage = {
            isDeleted : false
        };


        if (category_id && !mongoose.isValidObjectId(category_id)) {
            return res.status(200).json({ status: false, message: "invalid category id!" });
        }

        if (brand_id && !mongoose.isValidObjectId(brand_id)) {
            return res.status(200).json({ status: false, message: "invalid brand id!" })
        }

        if (type !== undefined) matchStage.type = type;
        if (startingPrice !== undefined && endingPrice !== undefined) {
            matchStage.salePrice = { $gte: startingPrice, $lte: endingPrice };
        }
        if (category_id !== undefined) matchStage.category_id = new mongoose.Types.ObjectId(category_id);
        if (isDeleted !== undefined) matchStage.isDeleted = isDeleted;
        if (brand_id !== undefined) matchStage.brand_id = new mongoose.Types.ObjectId(brand_id);
        if (name !== undefined) matchStage.name = name;

        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'productcategories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category_id'
                }
            },
            { $unwind: { path: '$category_id' } },
            {
                $lookup: {
                    from: 'imgurls',
                    localField: 'img_id',
                    foreignField: '_id',
                    as: 'img_id'
                }
            },
            { $unwind: { path: '$img_id' } },
            {
                $lookup: {
                    from: 'brands',
                    localField: 'brand_id',
                    foreignField: '_id',
                    as: 'brand_id'
                }
            },
            { $unwind: { path: '$brand_id' } }
        ];

        const products = await Product.aggregate(pipeline);

        if (user_id) {
            const wish = await wishList.findOne({ user_id: user_id })
            if (wish) {
                const wishProduct = wish.products.map(product => product.product_id.toString());
                products.forEach(product => {
                    product.isWishList = wishProduct.some(wish_id => wish_id === product._id.toString())
                })
            }
        }

        return res.status(200).json({
            status: true,
            total: products.length,
            product: products
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(200).json({ status: false, message: "Internal server error" });
    }
};

exports.productIdWithGet = async (req, res) => {
    try {
        const { product_id } = req.body

        if (!product_id) {
            return res.status(200).json({ status: false, message: "product_id is required!" })
        }

        if (!mongoose.isValidObjectId(product_id)) {
            return res.status(200).json({ status: false, message: "invalid id!" })
        }

        const product = await Product.findOne({ _id: product_id }).populate('category_id').populate('img_id')

        if (!product || product.isDeleted === true) {
            return res.status(200).json({ status: false, message: "product not found!" })
        }

        return res.status(200).json({ status: true, product: product })

    } catch {
        res.status(200).json({ message: "Server Is Busy" });
    }
}

// variation 5 api

exports.variationAdd = async (req, res, next) => {
    try {
        const { product_id, variation } = req.body;

        if (!product_id) {
            return res.status(200).json({ status: false, message: "product_id is required!" });
        }

        if (!variation) {
            return res.status(200).json({ status: false, message: "variation is required!" });
        }

        if (!mongoose.isValidObjectId(product_id)) {
            return res.status(200).json({ status: false, message: "Invalid product id!" });
        }

        const product = await Product.findOne({ _id: product_id });

        if (!product || product.isDeleted === true) {
            return res.status(404).json({ status: false, message: "Product not found!" });
        }

        if (product.type !== "variation") {
            return res.status(200).json({ status: false, message: "Product type is not 'variation'!" });
        }

        product.variation.push(variation);
        await product.save();

        return res.status(200).json({ status: true, message: "Product variation added successfully", variation: variation });
    } catch (error) {
        console.error("Error occurred while adding variation:", error);
        return res.status(200).json({ status: false, message: "An error occurred while adding variation", error: error.message });
    }
};

exports.updateVariation = async (req, res, next) => {
    try {

        const { product_id, updated_variation, variation_id } = req.body;
        if (!product_id) {
            return res.status(200).json({ status: false, message: "product_id is required!" })
        }

        if (!variation_id) {
            return res.status(200).json({ status: false, message: "variation_id is required!" })
        }

        if (!mongoose.isValidObjectId(product_id)) {
            return res.status(200).json({ status: false, message: "Invalid product id!" });
        }

        if (!mongoose.isValidObjectId(variation_id)) {
            return res.status(200).json({ status: false, message: "Invalid Variation id!" });
        }

        const product = await Product.findOne({ _id: product_id });

        if (!product || product.isDeleted) {
            return res.status(404).json({ status: false, message: "Product not found!" });
        }

        const variationIndex = product.variation.findIndex(variation => variation._id.toString() === variation_id);

        if (variationIndex === -1) {
            return res.status(404).json({ status: false, message: "Product variation not found!" });
        }

        Object.assign(product.variation[variationIndex], updated_variation);
        product.variation[variationIndex].updatedAt = new Date();

        await product.save();

        const updatedVariation = product.variation[variationIndex];

        return res.status(200).json({ status: true, message: "Product variation updated successfully", updated_variation: updatedVariation });
    } catch (error) {
        console.error("Error:", error);
        return res.status(200).json({ status: false, message: "Internal server error" });
    }
}


exports.deleteVariation = async (req, res, next) => {
    try {

        const { variation_id, product_id } = req.body;

        if (!product_id) {
            return res.status(200).json({ status: false, message: "product_id is required!" })
        }

        if (!variation_id) {
            return res.status(200).json({ status: false, message: "variation_id is required!" })
        }

        if (!mongoose.isValidObjectId(product_id)) {
            res.status(200).json({ status: false, message: "Invalid product id!" });
        }

        if (!mongoose.isValidObjectId(variation_id)) {
            res.status(200).json({ status: false, message: "Invalid Variation id!" });
        }

        const product = await Product.findOne({ _id: product_id });

        if (product && product.isDeleted === false) {
            const variationIndex = product.variation.findIndex(variation => variation._id.equals(variation_id));

            const delete_Variation = product.variation[variationIndex]

            if (variationIndex !== -1) {
                product.variation.splice(variationIndex, 1);
                await product.save();

                return res.status(200).json({ status: true, message: "Variation successfully deleted", delete_Variation: delete_Variation });

            } else {
                return res.status(404).json({ status: false, message: "Variation not found" });
            }
        }
        else {
            return res.status(404).json({ status: false, message: "Product not found" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(200).json({ status: false, message: "Internal server error" });
    }
}

exports.getVariation = async (req, res, next) => {
    try {

        const { product_id } = req.body;

        if (!product_id) {
            return res.status(200).json({ status: false, message: "product_id is required!" })
        }

        if (mongoose.isValidObjectId(product_id)) {
            const product = await Product.findOne({ _id: product_id });

            if (product) {
                res.json(product.variation);
            } else {
                res.status(404).json({ status: false, message: "Product Variation not found" });
            }
        } else {
            res.status(200).json({ status: false, message: "Invalid product ID" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(200).json({ status: false, message: "Internal server error" });
    }
}

exports.getVariationWithId = async (req, res, next) => {
    try {

        const { product_id, variation_id } = req.body

        if (!product_id) {
            return res.status(200).json({ status: false, message: "product_id is required!" })
        }

        if (!variation_id) {
            return res.status(200).json({ status: false, message: "variation_id is required!" })
        }

        if (!mongoose.isValidObjectId(product_id)) {
            res.status(200).json({ status: false, message: "Invalid product id!" });
        }

        if (!mongoose.isValidObjectId(variation_id)) {
            res.status(200).json({ status: false, message: "Invalid Variation id!" });
        }

        const product = await Product.findOne({ _id: product_id })
        if (product) {
            const variationIndex = product.variation.find(variation => variation._id == variation_id)
            console.log("variationIndex", variationIndex);
            if (variationIndex) {
                res.json(variationIndex)
            } else {
                res.status(200).json({ status: false, message: "Product Variation not found" });
            }
        } else {
            res.status(200).json({ status: false, message: "Product not found" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(200).json({ status: false, message: "Internal server error" });
    }

}

//filter product

exports.getRelatedProduct = async (req, res) => {

    try {

        const { product_id } = req.body;

        if (!product_id) {
            return res.status(200).json({ status: false, message: "product_id is required!" })
        }

        if (!mongoose.isValidObjectId(product_id)) {
            return res.status(404).json({ status: false, message: "Invalid Product_ID!" });
        }
        const product = await Product.findOne({ _id: product_id });
        if (product && product.isDeleted === false) {
            const { brand_id, category_id } = product;
            const related_Product = await Product.find({
                $or: [
                    { brand_id },
                    { category_id }
                ]
            })

            if (related_Product.length > 0) {
                return res.status(200).json({ status: true, total: related_Product.length, related_Product });

            } else {
                return res.status(404).json({ status: false, message: "Related products not found!" });
            }

        } else {
            return res.status(404).json({ status: false, message: "Product not found!" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(200).json({ status: false, message: "Internal server error" });
    }
}

exports.filterProductPrice = async (req, res) => {
    try {

        const { filter } = req.body;

        if (!filter) {
            return res.status(200).json({ status: false, message: "filter is required!" })
        }

        let products

        if (filter === "high to low") {
            products = await Product.find().sort({ salePrice: -1 })
        }

        else if (filter === "low to high") {
            products = await Product.find().sort({ salePrice: 1 })
        }

        else if (filter === "date wise") {
            products = await Product.find().sort({ createdAt: -1 })
        }

        else if (filter === "averageRating") {

            const reviews = await Review.find();
            const products = await Product.find();

            // Create a map to store the total rating and count of reviews for each product
            const productRatingMap = new Map();

            // Calculate total rating and count of reviews for each product
            reviews.forEach(review => {
                const productId = review.product_id.toString();
                const rating = review.rating;

                if (!productRatingMap.has(productId)) {
                    productRatingMap.set(productId, { totalRating: 0, reviewCount: 0 });
                }

                const productRating = productRatingMap.get(productId);
                productRating.totalRating += rating;
                productRating.reviewCount++;
            });

            // Calculate average rating for each product and store in a map
            const averageRatingMap = new Map();
            productRatingMap.forEach((value, productId) => {
                const averageRating = value.reviewCount > 0 ? Math.round((value.totalRating / value.reviewCount * 10)) / 10 : 0;
                averageRatingMap.set(productId, averageRating);
            });

            // Associate average ratings with resective products
            const productsWithAverageRating = products.map(product => {
                const productId = product._id.toString();
                const averageRating = averageRatingMap.has(productId) ? averageRatingMap.get(productId) : 0;
                return { ...product.toObject(), averageRating };
            });

            productsWithAverageRating.sort((a, b) => b.averageRating - a.averageRating);

            return res.status(200).json({ status: true, total: productsWithAverageRating.length, product: productsWithAverageRating })

        }

        else if (filter === "isDeleted_true") {
            products = await Product.find({ isDeleted: true })
        }

        else if (filter === "isDeleted_false") {
            products = await Product.find({ isDeleted: false })
        }

        else if (filter === "paid-And-trial") {
            const product = await Product.find()

            let paid = 0;
            let trial = 0;

            product.forEach(product => {
                product.paid ? paid++ : trial++;
            });

            products = {
                Paid: paid,
                Trial: trial
            }

        }

        else {
            return res.status(200).json({ status: false, message: "Invalid filter option!" })
        }

        return res.status(200).json({ status: true, total: products.length, product: products })
    } catch (error) {
        console.error("Error:", error);
        return res.status(200).json({ status: false, message: "Internal server error" });
    }
}

exports.productFilterDateWise = async (req, res) => {
    try {
        const { filter, start_Date, end_Date } = req.body;

        let products;
        let label;
        let response = [];

        if (filter === "Date-Wise-Filter") {

            console.log("filter");

            response = await Product.find({
                createdAt: {
                    $gte: new Date(start_Date),
                    $lte: new Date(end_Date)
                }
            });

            label = "Custom Date Filter";

        }
        if (filter == "day") {
            let dayData = [];
            for (let i = 0; i < 12; i++) {
                const startHour = new Date();
                startHour.setTime(startHour.getTime() + (5.5 * 60 * 60 * 1000));
                startHour.setHours(startHour.getHours() - i * 2);

                const endHour = new Date(startHour);
                endHour.setHours(endHour.getHours() - 2);

                const products = await Product.find({
                    isDeleted: false,
                    createdAt: { $gte: endHour, $lte: startHour }
                }).sort('-createdAt');

                const paid = products.filter(prod => prod.paid === true).length;
                const trial = products.filter(prod => prod.paid === false).length;

                startHour.setHours(startHour.getHours() - 5);
                startHour.setMinutes(startHour.getMinutes() - 30);
                endHour.setHours(endHour.getHours() - 5);
                endHour.setMinutes(endHour.getMinutes() - 30);

                // Formatting the hours to AM/PM format
                const formattedStartHour = startHour.toLocaleString('en-US', { hour: 'numeric', hour12: true });
                const formattedEndHour = endHour.toLocaleString('en-US', { hour: 'numeric', hour12: true });
                const formattedDate = `${formattedEndHour} - ${formattedStartHour}`;

                dayData.push({
                    date: formattedDate,
                    paid: paid,
                    trial: trial
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
            products = await Product.find({ createdAt: { $gte: lastWeekDate } });
            label = 'Week';

            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const formattedDate = date.toLocaleDateString('en-US', { day: '2-digit' });
                const formattedMonth = date.toLocaleDateString('en-US', { month: 'short' });
                let paidCount = 0;
                let trialCount = 0;

                products.forEach(product => {
                    const productDate = new Date(product.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                    if (productDate === `${formattedMonth} ${formattedDate}`) {
                        product.paid ? paidCount++ : trialCount++;
                    }
                });

                response.push({
                    Label: `${formattedDate} ${formattedMonth}`,
                    Paid: paidCount,
                    Trial: trialCount
                });

            }

        } else if (filter === "month") {
            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 7);
            products = await Product.find({ createdAt: { $gte: firstDayOfMonth } });
            label = 'Month';
            response = [];

            for (let i = 0; i < 6; i++) {
                const month = new Date(currentDate);
                month.setMonth(currentDate.getMonth() - i);
                const formattedMonth = month.toLocaleDateString('en-US', { month: 'short' });
                let paidCount = 0;
                let trialCount = 0;

                products.forEach(product => {
                    const productMonth = new Date(product.createdAt).toLocaleDateString('en-US', { month: 'short' });
                    if (productMonth === formattedMonth) {
                        product.paid ? paidCount++ : trialCount++;
                    }
                });

                response.push({
                    Label: formattedMonth,
                    Paid: paidCount,
                    Trial: trialCount
                });
            }

        } else if (filter === "year") {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            response = [];

            for (let i = 0; i < 6; i++) {
                const year = currentYear - i;
                products = await Product.find({
                    createdAt: {
                        $gte: new Date(year, 0, 1),
                        $lte: new Date(year, 11, 31, 23, 59, 59)
                    }
                });
                let paidCount = 0;
                let trialCount = 0;

                products.forEach(product => {
                    product.paid ? paidCount++ : trialCount++;
                });

                response.push({
                    Label: year.toString(),
                    Paid: paidCount,
                    Trial: trialCount
                });
            }

        } else {
            response = await Product.find();
            label = 'All Products';
        }

        res.status(200).json({
            status: true,
            Label: label,
            data: response
        });
    } catch (error) {
        res.status(200).json({ error: error.message });
    }
}

exports.filter_Data = async (req, res) => {
    try {
        const { filter_by } = req.body;

        if (filter_by && filter_by.data_type === "specific" && filter_by.date) {

            const { start_date, end_date } = filter_by.date;
            let label, specific_Products, specific_Products_Count;

            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
                return res.status(200).json({ status: false, message: "Invalid date format. Dates must be in YYYY-MM-DD format without any spaces." });
            }

            if (!start_date || !end_date) {
                return res.status(200).json({ status: false, message: "start_date and end_date are required" });

            }

            const totalProducts = await Product.countDocuments({});
            specific_Products = await Product.find({ createdAt: { $gte: new Date(start_date), $lte: new Date(end_date) } });
            specific_Products_Count = specific_Products.length;

            if (filter_by.is_deleted === "false") {
                label = 'not_deleted';

                const product = await Product.find({ updatedAt: { $gte: new Date(start_date), $lte: new Date(end_date) } });
                const notDeletedProduct = product.filter(product => !product.isDeleted);
                const notDeletedProductsCount = notDeletedProduct.length;

                if (filter_by.is_trial === "paid") {
                    label = 'paid';
                    const paidProduct = notDeletedProduct.filter(product => product.paid);
                    const paidProductCount = paidProduct.length;
                    return res.status(200).json({ status: true, label: label, total: totalProducts, notDeletedProductsCount: notDeletedProductsCount, paidProductCount: paidProductCount, paidProduct: paidProduct });
                }

                if (filter_by.is_trial === "trial") {
                    label = 'trial';
                    const trial = notDeletedProduct.filter(product => !product.paid);
                    const trial_Count = trial.length;
                    return res.status(200).json({ status: true, label: label, total: totalProducts, notDeletedProductsCount: notDeletedProductsCount, trial_Count: trial_Count, trial: trial });
                }

                if (filter_by.is_trial === "all") {
                    const paidProducts = notDeletedProduct.filter(product => product.paid).length;
                    const trialProducts = notDeletedProduct.length - paidProducts;
                    return res.status(200).json({ status: true, label: 'all', total: totalProducts, notDeletedProductsCount: notDeletedProductsCount, paidProducts: paidProducts, trialProducts: trialProducts, notDeletedProduct: notDeletedProduct });
                }

                return res.status(200).json({ status: true, label: label, total: totalProducts, notDeletedProductsCount: notDeletedProductsCount, notDeletedProduct: notDeletedProduct });
            }

            if (filter_by.is_deleted === "true") {
                label = 'deleted';

                const product = await Product.find({ updatedAt: { $gte: new Date(start_date), $lte: new Date(end_date) } });

                const deletedProduct = product.filter(product => product.isDeleted);
                const deletedProductsCount = deletedProduct.length;

                if (filter_by.is_trial === "paid") {
                    label = 'paid';
                    const paidProduct = deletedProduct.filter(product => product.paid);
                    const paidProductCount = paidProduct.length;
                    return res.status(200).json({ status: true, label: label, total: totalProducts, deletedProductsCount: deletedProductsCount, paidProductCount: paidProductCount, paidProduct: paidProduct });
                }

                if (filter_by.is_trial === "trial") {
                    label = 'trial';
                    const trial = deletedProduct.filter(product => !product.paid);
                    const trial_Count = trial.length;
                    return res.status(200).json({ status: true, label: label, total: totalProducts, deletedProductsCount: deletedProductsCount, trial_Count: trial_Count, trial: trial });
                }

                if (filter_by.is_trial === "all") {
                    const paidProducts = deletedProduct.filter(product => product.paid).length;
                    const trialProducts = deletedProduct.length - paidProducts;
                    return res.status(200).json({ status: true, label: 'all', total: totalProducts, deletedProductsCount: deletedProductsCount, paidProducts: paidProducts, trialProducts: trialProducts, deletedProduct: deletedProduct });
                }

                return res.status(200).json({ status: true, label: label, total: totalProducts, deletedProductsCount: deletedProductsCount, deletedProduct: deletedProduct });
            }

            if (filter_by.is_deleted === "all") {
                label = 'all';

                const product = await Product.find({ createdAt: { $gte: new Date(start_date), $lte: new Date(end_date) } });

                const DeletedProducts = await Product.countDocuments({ _id: { $in: product.map(product => product._id) }, isDeleted: true });

                if (filter_by.is_trial === "all") {
                    label = 'all';
                    const product = await Product.find({ createdAt: { $gte: new Date(start_date), $lte: new Date(end_date) } });
                    const notDeletedProducts = product.length - DeletedProducts;


                    const paidProducts = await Product.countDocuments({ _id: { $in: product.map(product => product._id) }, paid: true });
                    const trialProducts = product.length - paidProducts;
                    return res.status(200).json({ status: true, label: label, total: product.length, DeletedProducts: DeletedProducts, notDeletedProducts: notDeletedProducts, paidProducts: paidProducts, trialProducts: trialProducts, specific_Product: specific_Products });
                }

                return res.status(200).json({ status: true, label: label, total: product.length, DeletedProducts: DeletedProducts, notDeletedProducts: notDeletedProducts, product: product });
            }


            label = 'specific date';
            return res.status(200).json({ status: true, label: label, total: totalProducts, specific_Products_Count: specific_Products_Count, specific_Product: specific_Products });
        }

        if (filter_by && filter_by.data_type === "all_time") {
            const product = await Product.find();
            const totalProducts = product.length;
            let label = 'all_Time';

            if (filter_by.is_deleted === "false") {
                label = 'not_deleted';
                const notDeletedProducts = product.filter(product => !product.isDeleted);
                const notDeletedProductsCount = notDeletedProducts.length;

                if (filter_by.is_trial === "paid") {
                    const paidProducts = notDeletedProducts.filter(product => product.paid);
                    const paidProductCount = paidProducts.length;
                    return res.status(200).json({ status: true, label: 'paid', total: totalProducts, notDeletedProductsCount: notDeletedProductsCount, paidProductCount: paidProductCount, paidProducts: paidProducts });
                }

                if (filter_by.is_trial === "trial") {
                    const trialProducts = notDeletedProducts.filter(product => !product.paid);
                    const trialProductCount = trialProducts.length;
                    return res.status(200).json({ status: true, label: 'trial', total: totalProducts, notDeletedProductsCount: notDeletedProductsCount, trialProductCount: trialProductCount, trialProducts: trialProducts });
                }

                if (filter_by.is_trial === "all") {
                    const paidProducts = notDeletedProducts.filter(product => product.paid).length;
                    const trialProducts = notDeletedProducts.length - paidProducts;
                    return res.status(200).json({ status: true, label: 'all', total: totalProducts, notDeletedProductsCount: notDeletedProductsCount, paidProducts: paidProducts, trialProducts: trialProducts, notDeletedProducts: notDeletedProducts });
                }

                return res.status(200).json({ status: true, label: label, total: totalProducts, notDeletedProductsCount: notDeletedProductsCount, notDeletedProducts: notDeletedProducts });
            }

            if (filter_by.is_deleted === "true") {
                label = 'deleted';
                const deletedProducts = product.filter(product => product.isDeleted);
                const deletedProductsCount = deletedProducts.length;

                if (filter_by.is_trial === "paid") {
                    const paidProducts = deletedProducts.filter(product => product.paid);
                    const paidProductCount = paidProducts.length;
                    return res.status(200).json({ status: true, label: 'paid', total: totalProducts, deletedProductsCount: deletedProductsCount, paidProductCount: paidProductCount, paidProducts: paidProducts });
                }

                if (filter_by.is_trial === "trial") {
                    const trialProducts = deletedProducts.filter(product => !product.paid);
                    const trialProductCount = trialProducts.length;
                    return res.status(200).json({ status: true, label: 'trial', total: totalProducts, deletedProductsCount: deletedProductsCount, trialProductCount: trialProductCount, trialProducts: trialProducts });
                }

                if (filter_by.is_trial === "all") {
                    const paidProducts = deletedProducts.filter(product => product.paid).length;
                    const trialProducts = deletedProducts.length - paidProducts;
                    return res.status(200).json({ status: true, label: 'all', total: totalProducts, deletedProductsCount: deletedProductsCount, paidProducts: paidProducts, trialProducts: trialProducts, deletedProducts: deletedProducts });
                }

                return res.status(200).json({ status: true, label: label, total: totalProducts, deletedProductsCount: deletedProductsCount, deletedProducts: deletedProducts });
            }

            if (filter_by.is_deleted === "all") {
                label = 'all';
                const deletedProducts = await Product.countDocuments({ _id: { $in: product.map(product => product._id) }, isDeleted: true });
                const notDeletedProductsCount = product.length - deletedProducts;

                if (filter_by.is_trial === "all") {
                    const paidProducts = await Product.countDocuments({ _id: { $in: product.map(product => product._id) }, paid: true });
                    const trialProducts = product.length - paidProducts;
                    return res.status(200).json({ status: true, label: 'all', total: totalProducts, deletedProductsCount: deletedProducts, notDeletedProductsCount: notDeletedProductsCount, paidProducts: paidProducts, trialProducts: trialProducts, product: product });
                }

                return res.status(200).json({ status: true, label: label, total: totalProducts, deletedProductsCount: deletedProducts, notDeletedProductsCount: notDeletedProductsCount, product: product });
            }

            return res.status(200).json({ status: true, label: label, total: totalProducts, product: product });
        }


        return res.status(200).json({ status: false, error: "Invalid request" });
    } catch (error) {
        console.error("Error:", error);
        return res.status(200).json({ status: false, error: "Internal server error" });
    }
};

exports.multiple_product_update = async (req, res) => {
    try {
        const productsToUpdate = req.body.products;

        if (!productsToUpdate || !Array.isArray(productsToUpdate) || productsToUpdate.length === 0) {
            return res.status(200).json({ status: false, message: "Invalid products data!" });
        }

        for (const productData of productsToUpdate) {
            const { name, product_id, variations, regularPrice, salePrice, description, img_id, category_id, slug, sku, isPublished, isFeatured, isDisable, isDeleted, stock, brand_id } = productData;

            if (!product_id) {
                return res.status(200).json({ product_id, status: false, message: "Product id required!" });
            }

            if (!mongoose.isValidObjectId(product_id)) {
                return res.status(200).json({ product_id, status: false, message: "Invalid product Id!" });
            }

            const product = await Product.findOne({ _id: product_id });
            if (!product) {
                return res.status(404).json({ product_id, status: false, message: "Product not found!" });
            }

            if (regularPrice !== undefined && salePrice !== undefined && regularPrice < salePrice) {
                return res.status(200).json({ product_id, status: false, message: "Regular price must be greater than sale price!" });
            }

            // category

            if (category_id && !mongoose.isValidObjectId(category_id)) {
                return res.status(200).json({ product_id, status: false, message: "Invalid category Id!" });
            }

            const category = await ProductCategory.findOne({ _id: category_id });
            if (category_id && !category) {
                return res.status(404).json({ product_id, status: false, message: "category not found!" });
            }

            // img

            if (img_id && !mongoose.isValidObjectId(img_id)) {
                return res.status(200).json({ product_id, status: false, message: "Invalid img Id!" });
            }

            const img = await ImgUrl.findOne({ _id: img_id });

            if (img_id && !img) {
                return res.status(404).json({ product_id, status: false, message: "img not found!" });
            }

            // brand

            if (brand_id && !mongoose.isValidObjectId(brand_id)) {
                return res.status(200).json({ product_id, status: false, message: "invalid brand Id!" });
            }

            const brand = await Brand.findOne({ _id: brand_id });

            if (brand_id && !brand) {
                return res.status(404).json({ product_id, status: false, message: "brand not found!" });
            }

            if (product.type === "simple") {
                if (variations && variations.length > 0) {
                    return res.status(200).json({ product_id, status: false, message: "Simple product should not have variations!" });
                }
            }
            else if (product.type === "variation") {
                z
                if (!variations || variations.length === 0) {
                    return res.status(200).json({ product_id, status: false, message: "Variation product must include variations!" });
                }

                for (const variationData of variations) {
                    const { variation_id, regularPrice: varRegularPrice, salePrice: varSalePrice, ...variationDetails } = variationData;

                    if (!variation_id) {
                        return res.status(200).json({ product_id, variation_id, status: false, message: "variation id required!" });
                    }

                    if (!mongoose.isValidObjectId(variation_id)) {
                        return res.status(200).json({ product_id, variation_id, status: false, message: "invalid variation id!" });
                    }

                    if (varRegularPrice !== undefined && varSalePrice !== undefined && varRegularPrice < varSalePrice) {
                        return res.status(200).json({ product_id, variation_id, status: false, message: "Regular price must be greater than sale price!" });
                    }

                    const variationIndex = product.variation.findIndex(v => v._id.toString() === variation_id);
                    if (variationIndex === -1) {
                        return res.status(404).json({ product_id, variation_id, status: false, message: "Variation not found!" });
                    }

                    Object.assign(product.variation[variationIndex], variationDetails, { updatedAt: new Date() });

                    // Ensure the variation prices are explicitly set
                    if (varRegularPrice !== undefined) {
                        product.variation[variationIndex].regularPrice = varRegularPrice;
                    }
                    if (varSalePrice !== undefined) {
                        product.variation[variationIndex].salePrice = varSalePrice;
                    }

                    // Replace spaces with dashes in the variation slug
                    product.variation[variationIndex].slug = product.variation[variationIndex].slug.replace(/\s+/g, '-');
                }
            }
            else {
                return res.status(200).json({ product_id, status: false, message: "Invalid product type!" });
            }

            let discount;

            if (regularPrice && salePrice) {
                discount = Math.round((regularPrice - salePrice) / regularPrice * 100);
            } else {
                discount = product.discount;
            }

            if (name) {
                product.name = name;
            }

            if (regularPrice) {
                product.regularPrice = regularPrice;
            }

            if (salePrice) {
                product.salePrice = salePrice;
            }

            if (description) {
                product.description = description;
            }

            product.discount = discount;

            if (img_id) {
                product.img_id = img_id;
            }

            if (category_id) {
                product.category_id = category_id;
            }

            if (slug) {
                const modifiedSlug = slug ? slug.replace(/\s+/g, '-') : product.slug;
                product.slug = modifiedSlug;
            }

            if (sku) {
                product.sku = sku;
            }

            if (isPublished !== undefined) {
                product.isPublished = isPublished;
            }

            if (isFeatured !== undefined) {
                product.isFeatured = isFeatured;
            }

            if (isDisable !== undefined) {
                product.isDisable = isDisable;
            }

            if (isDeleted !== undefined) {
                product.isDeleted = isDeleted;
            }

            if (stock !== undefined) {
                product.stock = stock;
            }

            if (brand_id) {
                product.brand_id = brand_id;
            }

            product.updatedAt = new Date();

            await product.save();

        }

        return res.status(200).json({ status: true, message: "Products updated successfully" });

    } catch (error) {
        console.error(error);
        return res.status(200).json({ status: false, message: "An error occurred while updating the products." });
    }
};



// { if (filter_by && filter_by.data_type === "all_time") {

//     const label = 'all_time';

//     try {
//         const products = await Product.find();

//         return res.status(200).json({ status: true,label:label ,total: products.length, Data: products });
//     }
//         catch (error) {
//         console.error("Error:", error);
//         res.status(200).json({ status: false, error: "Internal server error" });
//     }
// }}

// if (filter == "day") {
//     let dayData = [];
//     for (let i = 0; i < 12; i++) {
//         const startHour = new Date();
//         startHour.setTime(startHour.getTime() + (5.5 * 60 * 60 * 1000));
//         startHour.setHours(startHour.getHours() - i * 2);

//         const endHour = new Date(startHour);
//         endHour.setHours(endHour.getHours() - 2);

//         const products = await Product.find({
//             isDeleted: false,
//             createdAt: { $gte: endHour, $lte: startHour }
//         }).sort('-createdAt');

//         const paid = products.filter(prod => prod.paid === true).length;
//         const trial = products.filter(prod => prod.paid === false).length;

//         startHour.setHours(startHour.getHours() - 5);
//         startHour.setMinutes(startHour.getMinutes() - 30);
//         endHour.setHours(endHour.getHours() - 5);
//         endHour.setMinutes(endHour.getMinutes() - 30);

//         // Formatting the hours to AM/PM format
//         const formattedStartHour = startHour.toLocaleString('en-US', { hour: 'numeric', hour12: true });
//         const formattedEndHour = endHour.toLocaleString('en-US', { hour: 'numeric', hour12: true });
//         const formattedDate = `${formattedEndHour} - ${formattedStartHour}`;

//         dayData.push({
//             date: formattedDate,
//             paid: paid,
//             trial: trial
//         });
//     }

//     return res.status(200).json({
//         status: true,
//         label: 'Day',
//         data: dayData
//     });
// }