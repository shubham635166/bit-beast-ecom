const app = require('express');
const router = app.Router();

const { product, productUpdate, productDelete, productGet, productIdWithGet, variationAdd, updateVariation, deleteVariation, getVariation, getVariationWithId , multipleDelete, allDelete , getRelatedProduct, filterProductPrice, productFilterDateWise, filter_Data, multiple_product_update, ttask, filter_data } = require('../controller/productController');

const { user, login, userUpdate, getData, changePassword, userDelete, userData, captcha, getAllUserData, addGuestUser } = require('../controller/userController');

const { productCategory, updateCategory, deleteCategory, getCategory } = require('../controller/categoryController');

const { upload, deleteImage, getImage, imgUpdate, imageCreate, saveMedia, deleteMedia } = require('../controller/imgController');

const { protect } = require('../middleware/userMiddleware');

const { cartAdd, getCart , removeCart , removeCartProduct, applyCoupon, findReviewProduct } = require('../controller/cartController');

const { createCoupon, updateCoupon, getAllCoupon, getIdWithCoupon, deleteCoupon } = require('../controller/couponController');

const { createAddress, updateAddress, getAddress, getOneAddress, deleteAddress } = require('../controller/addressController');

const { addBrand, updateBrand, getBrand, getOneBrand, deleteBrand } = require('../controller/brandController');

const { return_request_controller, updateReturn, getReturn, getOneReturn, deleteReturn } = require('../controller/returnRequestPolicyController');

const { add_wishList, removeWishListProduct, getWishList, removeWishList } = require('../controller/wishListController');

const { addSubscribe, updateSubscribe, deleteSubscribe, getAllSubscribe, getOneSubscribe } = require('../controller/subscribeController');
const { addReview, updateReview, deleteReview, getReview, getOneReview } = require('../controller/reviewController');
const { addProductOne, updateProductOne, productDeleteOne, getAllProductOne, getOneProductOne, variationAddOne, task } = require('../controller/productOneController');
const { sendOtp, verifyOtp } = require('../controller/otpController');
const { send_Notification, get_Notification, pre_view_notification, delete_many_notification, delete_One_Notification, update_Notification } = require('../controller/notificationController');
const { add_Tag, update_Tag, get_Tag, get_One_Tag, delete_Tag } = require('../controller/product.Tag.Controller');
const { add_Order, sales_Expanse, compare_sale, findOrderReviewProduct } = require('../controller/order.controller');
const { createApp, updateApp, getApp } = require('../controller/app.controller');


// router.use('/userData',protect)

router.post("/user", user)
router.post("/login",login)
router.post('/changePassword', protect, changePassword)
router.get('/userData', protect, userData)
router.post("/guest",addGuestUser)

router.post("/update", protect ,userUpdate)
router.delete("/delete", userDelete)
router.get("/getData", getData)


//product and product variation


router.post('/product', product)
router.post("/productUpdate", productUpdate)
router.post("/productDelete", productDelete)
router.get('/productGet' ,productGet)
router.post('/productIdGet', productIdWithGet)
router.post('/multipleProductDelete', multipleDelete)
router.post('/allProductDeleted',allDelete)
router.post('/multiple_Product_Update' , multiple_product_update)
router.post('/product_averageRating' , filter_data)

router.post('/relatedProduct',getRelatedProduct)
router.post('/filterProductPrice',filterProductPrice)
router.post('/dateWise',productFilterDateWise)

//product variation

router.post('/variation', variationAdd)
router.post('/updateVariation', updateVariation)
router.post('/deleteVariation', deleteVariation)
router.get('/getVariation', getVariation)
router.get('/getVariationWithId', getVariationWithId)

//img

// router.post("/img", upload)
// router.delete("/imgDelete", deleteImage)
// router.get("/imageGet", getImage)
// router.put("/imgUpdate", imgUpdate)

router.post('/img',imageCreate)
router.post('/imgUpdate',saveMedia)
router.post('/imgDelete',deleteMedia)

//productCategory

router.post("/productCategory", productCategory)
router.put("/updateCategory", updateCategory)
router.delete("/deleteCategory", deleteCategory)
router.get("/categoryGet", getCategory)

// cart

router.post('/cart', protect, cartAdd)
router.get('/getCart',protect,getCart)
router.post('/removeCart',protect,removeCart)
router.post('/cartProductDelete',protect,removeCartProduct)
router.post('/applyCoupon',protect,applyCoupon)
router.post('/findReviewProduct',protect,findReviewProduct)

// coupon

router.post('/coupon',createCoupon)
router.post('/updateCoupon',updateCoupon)
router.get('/getAllCoupon',getAllCoupon)
router.get('/getIdWithCoupon',getIdWithCoupon)
router.post('/deleteCoupon',deleteCoupon)

//address

router.post('/address',protect,createAddress)
router.post('/updateAddress',protect , updateAddress)
router.get('/allAddress',protect,getAddress)
router.get('/getOneAddress',protect,getOneAddress)
router.post('/deleteAddress',protect,deleteAddress)

//brand

router.post('/brand',addBrand)
router.post('/brandUpdate',updateBrand)
router.get('/brandGet',getBrand)
router.get('/oneBrandGet',getOneBrand)
router.post('/deleteBrand',deleteBrand)

// return 

router.post('/return',protect,return_request_controller)
router.post('/returnUpdate',protect,updateReturn)
router.post('/getReturn',protect,getReturn)
router.post('/retOneReturn',protect,getOneReturn)
router.post('/deleteReturn',protect,deleteReturn)

//wishList

// router.post('/wishList',protect,add_wishList)
router.post('/wishList',protect,add_wishList)
router.post('/removeWishListProduct',protect,removeWishListProduct)
router.post('/getWishList',protect,getWishList)
router.post('/removeWishList',protect,removeWishList)

// subscribe

router.post('/subscribe',addSubscribe)
router.post('/updateSubscribe',updateSubscribe)
router.post('/deleteSubscribe',deleteSubscribe)
router.post('/getSubscribe',getAllSubscribe)
router.post('/getOneSubscribe',getOneSubscribe)

router.post('/userDataFilter' , protect ,getAllUserData)

// review

router.post('/addReview',protect,addReview)
router.post('/updateReview',protect,updateReview)
router.post('/deleteReview',protect,deleteReview)
router.post('/getReview',protect,getReview)
router.post('/getOneReview',protect,getOneReview)


// new task

// router.post('/newProductAdd', addProductOne)
// router.post('/newProductUpdate', updateProductOne)
// router.post('/newProductDelete', productDeleteOne)
// router.post('/newProductGetAll', getAllProductOne)
// router.post('/newProductGetOne', getOneProductOne)

// task variation

// router.post('/newProductVariationAdd', variationAddOne)
// router.post('/newProductVariationUpdate', updateVariation)
// router.post('/newProductVariationDelete', deleteVariation)
// router.get('/newProductVariationGet', getVariation)
// router.get('/newProductVariationGetWithId', getVariationWithIdOne)


// notification

router.post('/addNotification',send_Notification)
router.post('/update_Notification',update_Notification)  
router.post('/getNotification',protect,get_Notification)
router.post('/pre_View_Notification',protect, pre_view_notification)
router.post('/delete_many__Notification',protect, delete_many_notification)
router.post('/delete_one_notification',protect,delete_One_Notification)

//tag

router.post('/add_tag',add_Tag)
router.post('/update_tag',update_Tag)
router.get('/get_tag',get_Tag)
router.post('/get_one_tag',get_One_Tag)
router.post('/delete_tag',delete_Tag)


// order

router.post('/order' , protect , add_Order)
router.post('/findOrderReviewProduct' , protect , findOrderReviewProduct)


router.post('/task', task)

router.post('/otp',sendOtp)
router.post('/verify-Otp',verifyOtp)


router.post('/taste', filter_Data)

router.post('/sales' , sales_Expanse)
router.post('/compare' , compare_sale)


// app

router.post('/app' ,createApp)
router.post('/appUpdate' , updateApp)
router.post('/appGet' , getApp)

module.exports = router;