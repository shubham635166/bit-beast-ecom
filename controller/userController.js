const User = require('../model/userModel');
const key = require('../middleware/secreteKey')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const PhoneNumber = require('libphonenumber-js');
const Cart = require('../model/cart');
const Address = require('../model/addressModel');
const wishList = require('../model/wishListModel');
const return_Request = require('../model/returnRequestModel');
const sendToken = require('../middleware/sendToken')

function validatePhoneNumber(phoneNumber) {
  try {
    const number = PhoneNumber(phoneNumber, 'IN');
    return number.isValid();
  } catch (error) {
    return res.status(200).json({ status: false, message: error })
  }
}

exports.user = async (req, res) => {
  try {

    const { name, email, password, age, password_confirmation, isPhoneNumber, type , pages } = req.body

    const validation = ["name", "email", "password", "age", "password_confirmation", "isPhoneNumber", "type"]

    for (let i = 0; i < validation.length; i++) {

      const fieldName = validation[i];

      if (!req.body[fieldName]) {
        return res.status(200).json({ status: false, message: `${fieldName} is required!` });
      }
    }
    const user = await User.findOne({ isPhoneNumber: isPhoneNumber })

    if (user) {
      return res.status(200).json({ status: false, message: "phone number already exists" })
    } 
    else {
      if (name && email && password && password_confirmation && age && isPhoneNumber) {
        if (password === password_confirmation) {
          const salt = await bcrypt.genSalt(10)
          const hashPassword = await bcrypt.hash(password, salt)
          const doc = new User({
            name: name,
            email: email,
            password: hashPassword,
            age: age,
            isPhoneNumber: isPhoneNumber,
            type: type,
            pages, pages
          })
          await doc.save()
          sendToken(guest, 200, res);
          return res.status(200).json({status:true , message : "user successfully add" , user:doc})
          const saved_user = await User.findOne({ email: email })

        } else {
          res.send({ "status": "failed", "message": "Password and Confirm Password doesn't match" })
        }
      } else {
        res.send({ "status": "failed", "message": "All fields are required" })
      }
    }
  }
  catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email) {
      return res.status(200).json({ status: false, message: "email is required!" })
    }

    if (!password) {
      return res.status(200).json({ status: false, message: "password is required!" })
    }


    if (email && password) {
      const user = await User.findOne(({ email: email }))
      if (user != null) {
        const isMatch = await bcrypt.compare(password, user.password)
        if (user.email === email && isMatch) {

          sendToken(user, 200, res);

        } else {
          return res.json({ status: false , message: "Email or Password is not Valid" })
        }
      } else {
        res.status(200).send({ success: false, message: "User are not register" })
      }
    } else {
      res.status(200).send({ success: true, message: "All filed required" })
    }
  }
  catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
}

exports.changePassword = async (req, res) => {
  try {

    const { password, password_confirmation } = req.body

    if (!password_confirmation) {
      return res.status(200).json({ status: false, message: "password_confirmation is required!" })
    }

    if (!password) {
      return res.status(200).json({ status: false, message: "password is required!" })
    }

    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
      } else {
        const salt = await bcrypt.genSalt(10)
        const newHashPassword = await bcrypt.hash(password, salt)
        console.log("req.user=>", req.user);
        await User.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword }, updatedAt: new Date() })
        res.send({ "status": "success", "message": "Password changed successfully" })
        // res.send({ "status": "success", "message": "Password changed successfully", "userId" : req.user._id})
      }
    } else {
      res.send({ "status": "failed", "message": "All Fields are Required" })
    }
  }
  catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
}

exports.userData = async (req, res) => {
  try {

    res.send({ "user": req.user })
    // res.send({"user": req.user._id}) // only display user id
  }
  catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
}

exports.userUpdate = async (req, res) => {
  try {
    const user = await User.findOne({_id : req.user._id})
    const { name, email, password, age, type ,pages } = req.body

    const validation = ["name", "email", "password", "age", "type"]

    for (let i = 0; i < validation.length; i++) {

      const fieldName = validation[i];

      if (!req.body[fieldName]) {
        return res.status(200).json({ status: false, message: `${fieldName} is required!` });
      }
    }

    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    if (name!== undefined) user.name = name
    if (email!== undefined) user.email = email
    if (password!== undefined) user.password = password
    if (age!== undefined) user.age = age
    if (type!== undefined) user.type = type

    if (pages !== undefined) {
      if(pages["Privacy-Policy"] !== undefined) user.pages["Privacy-Policy"] = pages["Privacy-Policy"]
      if(pages["Terms-And-Condition"] !== undefined) user.pages["Terms-And-Condition"] = pages["Terms-And-Condition"]
      if(pages["Refund-Policy"] !== undefined) user.pages["Refund-Policy"] = pages["Refund-Policy"]
    }

    user.updatedAt = new Date()
    await user.save()

    res.status(200).json({ message: "User data updated" , user: user })
  }
  catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
}

exports.userDelete = async (req, res) => {
  try {

    const id = await User.findById(req.body.id)
    if (!id) {
      res.status(404).json({ message: "User not found" });
    }
    userDeleate = await User.findByIdAndDelete(id)
    res.status(200).json({ success: true })
  }
  catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
}

exports.getData = async (req, res) => {
  try {
    const products = await User.find();
    res.json(products);
  }
  catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
}

// exports.captcha = async(req,res)=>{
//   const key = '6LctCrQpAAAAAC8i-lFEKyhe4zyqjAgxPDnHYXJK'
//   const reCaptchaValue = '6LctCrQpAAAAALTNad6J8eYDcMXDj3mzv7PR_XBD'
//   axios({
//     url: `https://www.google.com/recaptcha/api/siteverify?secret=${key}&resonse${reCaptchaValue}`

//   }).then(async ({data}) => {
//     console.log("data", data);

//     if (data.success) {
//       const {name,email,password,age,isPhoneNumber } = req.body
//       const user = await User({
//         name,
//         email,
//         password,
//         age,
//         isPhoneNumber
//       })
//       await user.save()
//       res.status(200).json({status:true , message :"user create successfully"})
//     } else {
//       res.status(200).json({status:false,message: 'Recaptcha verification failed!'})
//   }
//   })
//   .catch(error => {
//     console.log(error)
//     res.status(200).json({message: 'Invalid Recaptcha'})
// })
// }

// exports.captcha = async (req, res) => {
//   const key = '6LdxU7QpAAAAAJL0qXI3TvNXSY_KzwcxVy_wbMWz';
//   const captcha = "09ABIEJotr-Km1ChNjNQO5Ow6KsA8YajUwKtdq_iCRdPWjU1YcmMqoffKDDPyWZo-v6gjNM_aMT0KB7rVkZP1RVE6QK1ADq_uGvda9qA"
//   // Take reCAPTCHA value from request body
//   if(!captcha){
//     console.log("err");
//     return res.json({"success":false, "msg":"Capctha is not checked"});

// }
//   axios({
//     url: `https://www.google.com/recaptcha/api/siteverify?secret=${key}&resonse=${captcha}`,
//     method: 'post'
//   }).then(async ({ data }) => {
//     console.log("data", data);

//     if (data.success == true) {
//       const { name, email, password, age, isPhoneNumber } = req.body;
//       const user = await User({
//         name,
//         email,
//         password,
//         age,
//         isPhoneNumber
//       });
//       await user.save();
//       res.status(200).json({ status: true, message: "User created successfully" });
//     } else {
//       res.status(200).json({ status: false, message: 'reCAPTCHA verification failed!' });
//     }
//   }).catch(error => {
//     console.log(error);
//     res.status(200).json({ message: 'Invalid reCAPTCHA' });
//   });
// };


// exports.getAllUserData = async (req, res) => {

//   const { filter } = req.body

//   if (filter === "cart" || filter === "address" || filter === "wishList" || filter === "returnRequest") {

//     if (filter === "cart") {
//       const cart = await Cart.find({ user_Id: req.user._id }).populate('products.product_Id')
//       if (cart) {
//         return res.status(200).json({ status: true, cart: cart })
//       } else {
//         return res.status(200).json({ status: false, message: "user cart not found!" })
//       }
//     }

//     if (filter === "address") {
//       const address = await Address.find({ user_Id: req.user._id })
//       if (address) {
//         return res.status(200).json({ status: true, total: address.length, address: address })
//       } else {
//         return res.status(200).json({ status: false, message: "user cart not found!" })
//       }
//     }

//     if (filter === "wishList") {
//       const WishList = await wishList.find({ user_id: req.user._id }).populate('products.product_id')
//       if (WishList) {
//         return res.status(200).json({ status: true, wishList: WishList })
//       } else {
//         return res.status(200).json({ status: false, message: "user cart not found!" })
//       }
//     }


//     if (filter === "returnRequest") {
//       const returnRequest = await return_Request.find({ user_id: req.user._id, status: "refunded" });
//       if (returnRequest && returnRequest.length > 0) {
//         return res.status(200).json({ status: true, total: returnRequest.length, returnRequest: returnRequest });
//       } else {
//         return res.status(200).json({ status: false, message: "Not found refunded user product!" });
//       }
//     }
//   }
//   else {
//     return res.status(200).json({ status: false, message: "user data not found!" })
//   }
// }

exports.getAllUserData = async (req, res) => {
  try {

    const userData = {};

    const cart = await Cart.find({ user_Id: req.user._id }).populate('products.product_Id');
    userData.cart = cart

    const cartTotal = cart.reduce((total, item) => total + item.products.length, 0)

    const address = await Address.find({ user_Id: req.user._id });
    userData.address = address

    const WishList = await wishList.find({ user_id: req.user._id }).populate('products.product_id');
    userData.WishList = WishList

    const wishListTotal = WishList.reduce((total, item) => total + item.products.length, 0)


    const refundedProduct = await return_Request.find({ user_id: req.user._id, status: "refunded" });
    userData.refundedProduct = refundedProduct

    const returnRequestProduct = await return_Request.find({ user_id: req.user._id });
    userData.returnRequestProduct = returnRequestProduct

    return res.status(200).json({
      status: true,
      cart_Total_Product: cartTotal, total_WishList_product: wishListTotal, total_Refunded_Product: refundedProduct.length, total_Return_Request_Product: returnRequestProduct.length, total_Address: address.length,
      userData: userData
    });

  }
  catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }

}

exports.addGuestUser = async (req, res) => {
  try {
    const guest = await User({});

    await guest.save();

    // const token = jwt.sign({ userID: guest._id }, key.key);

    // // Set the token in a cookie
    // res.cookie('token', token, { httpOnly: true });

    // const token = jwt.sign({ decodedData: guest._id }, key.key);
    // guest.token = token;
    // await guest.save();
    // res.cookie('token', token, {
    //     httpOnly: true,
    // });

    sendToken(guest, 200, res);
    // res.status(200).json({ status: true, message: "Guest user created successfully", token: token });
  }
  catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
}