const { response } = require('express');
const express = require('express');
const session = require('express-session');
const router = express.Router();
const userCont = require('../controllers/userController');


router.get('/', userCont.getHome);

router.get('/login', userCont.getLogin)

router.get('/password', userCont.getPassword)

router.get('/password/:id', userCont.getPasswordId)

router.post('/password', userCont.postPassword)

router.post('/login/:id', userCont.postLoginId)

router.get('/logout', userCont.getLogout)



router.get('/account',userCont.verifyLogin, userCont.getAccount)

router.post('/update-ac',userCont.verifyLogin, userCont.postUpdateAc)

router.post('/change-pass', userCont.verifyLogin, userCont.postChangePass)

router.get('/addresses',userCont.verifyLogin, userCont.getAddresses)

router.get('/add-address',userCont.verifyLogin,userCont.getAddAddresses)

router.post('/address',userCont.verifyLogin, userCont.postAddress)

router.get('/edit-address',userCont.verifyLogin, userCont.getEditAddressId)




router.get('/wishlist', userCont.verifyLogin, userCont.getWishlist)

router.get('/add-to-wishlist/:id', userCont.verifyLogin, userCont.getAddToWishlist)

router.get('/wishlist-remove/:id', userCont.verifyLogin, userCont.getWishlistRemove)

router.get('/cart', userCont.verifyLogin, userCont.getCart)

router.get('/add-to-cart/:id',userCont.verifyLogin, userCont.getAddCart)

router.get('/cart-remove/:id', userCont.verifyLogin, userCont.getCartRemove)

router.get('/checkout',userCont.verifyLogin, userCont.getCheckout)

router.get('/coupon-check',userCont.verifyLogin,userCont.getCouponCheck)

router.get('/cash-order',userCont.verifyLogin,userCont.getCashOrder)

router.get('/pay-order',userCont.verifyLogin, userCont.getPayOrder)

router.get('/paypal-order',userCont.verifyLogin, userCont.getPaypalOrder)

router.post('/verify-payment',userCont.verifyLogin,userCont.postVerifyPayment)




router.get('/orders',userCont.verifyLogin,userCont.getOrders)

router.get('/order-info',userCont.verifyLogin,userCont.getOrderInfo)

router.get('/cancel-order/:id',userCont.verifyLogin,userCont.getCancelOrderId)

router.get('/return-order/:id', userCont.verifyLogin, userCont.getReturnOrderId)




router.get('/blog', userCont.getBlog)

router.get('/single-blog', userCont.getSingleBlog)

router.get('/single-product', userCont.getSingleProductId)

router.get('/all-products',userCont.getAllProducts)

router.get('/her',userCont.getHer)

router.get('/him',userCont.getHim)

router.get('/contact', userCont.getContact)


module.exports = router;
