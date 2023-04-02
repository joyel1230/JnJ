require('dotenv').config()

const { response } = require('express');
const { COUPON_COLLECTION } = require('../config/collections');
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const paypalHelpers = require('../helpers/paypal-helpers')
const reportHelpers = require('../helpers/report-helpers')
const couponHelpers = require('../helpers/coupon-helpers')
const multer = require('multer')

let count = 1;
let boo;
const userd = true;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const myNumber = process.env.TWILIO_MY_NUMBER;
// const myOTP = process.env.TWILIO_MY_OTP;
const client = require('twilio')(accountSid, authToken);


module.exports = {
  verifyLogin: (req, res, next) => {
    if (req.session.login) {
      next();
    } else {
      res.redirect('/login');
    }
  },
  getHome: (req, res, next) => {
    reportHelpers.searches()
    // console.log(req);
    let userID = req.session.user;
    return new Promise((resolve, reject) => {
      
      productHelpers.getAllProducts().then((array) => {
        let products = array[1]
        let banner = array[2]

        banner = banner?.image
        if (userID) {
          if (count === 1) {
            var pop = true
            count++;
          }
        } else {
          count = 1;
        }
        if (userID?.blocked) {
          res.redirect('/logout');
        } else {
          // console.log(products);
          products.map((product) => {
            product.price = product.price.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
              currencyDisplay: 'symbol',
              minimumFractionDigits: 2
            })
          })
          res.render('user/index', { userd, userID, pop, boo, products, banner });
          boo = false;
        }

      })
    })
    // console.log(userID);

  },
  getLogin: (req, res) => {
    if (req.session.login) {
      res.redirect('/');
    } else {
      res.render('user/mobile')
    }
  },
  getPassword: (req, res) => {
    if (req.session.login) {
      res.redirect('/');
    } else {
      userHelpers.validUser(req.query.mobile).then((valid) => {
        var newMobile = req.query.mobile
        if (valid) {
          var mobile = valid.mobile;
          if (valid.blocked) {
            res.render('user/mobile', { block: true })
          } else {
            res.render('user/login', { mobile });
          }

        } else {
          let mob = '+91'
          mob += newMobile;
         
          client.verify.v2.services('VA25a92551fa5e3c0f98c42a1d8d1878e1')
                .verifications
                .create({to: mob , channel: 'sms'})
                .then(verification => {console.log(verification.status)
                  res.render('user/forgot', { newMobile });
                })
                .catch((err)=>{
                  res.render('user/mobile', { block: true })
                })


          // let myOTP = Math.floor(Math.random() * 9000) + 1000;
          // req.session.OTP = myOTP
          // client.messages
          //   .create({
          //     body: 'OTP: ' + myOTP + ' MOB: ' + mob,
          //     from: myNumber,
          //     to: '+919633667502'
          //   })
          //   .then(message => console.log(message.sid));


          
        }
      })
    }
  },
  getPasswordId: (req, res) => {
    var newMobile = req.params.id
    if (req.session.user) {
      res.redirect('/')
    } else {
      let mob = '+91'
      mob += newMobile;


      client.verify.v2.services('VA25a92551fa5e3c0f98c42a1d8d1878e1')
                .verifications
                .create({to: mob , channel: 'sms'})
                .then(verification => console.log(verification.status));
      // let myOTP = Math.floor(Math.random() * 9000) + 1000;
      // req.session.OTP = myOTP
      // client.messages
      //   .create({
      //     body: 'OTP: ' + myOTP + ' MOB: ' + mob,
      //     from: myNumber,
      //     to: '+919633667502'
      //   })
      //   .then(message => console.log(message.sid));
      res.render('user/forgot', { newMobile });
    }
  },
  postPassword: (req, res) => {
    var mobileNew = '+91'
    var newMobile = req.body.mobile;
    var mobile = newMobile;
    mobileNew += newMobile;
    const OTP = req.body.OTP

    // if (req.session.OTP == req.body.OTP) {
    //   otp = true;
    // }

    client.verify.v2.services('VA25a92551fa5e3c0f98c42a1d8d1878e1')
      .verificationChecks
      .create({to: mobileNew , code: OTP})
      .then((verification_check)=>{
        console.log(verification_check.status);
          if (verification_check.status === 'approved') {
        // console.log(verification_check.status+'yes');
        userHelpers.doSignup(req.body).then((response) => {
            res.render('user/login', { mobile , pop: true })
          })
          } else {
        // console.log(verification_check.status+'no');
            res.render('user/forgot', { newMobile, pop: true });
          }
    }
    );
  },
  postLoginId: (req, res) => {
    let id = req.params.id;
    let mobile = id;
    let pass = req.body.password;
    let cart = req.session.cart
    userHelpers.doLogin(id, pass).then((response) => {
      if (response.status) {
        req.session.login = true;
        req.session.user = response.user;
        req.session.user.cartNum = response.cartNum;
        // console.log(req.session.cart);
        userHelpers.active(req.session.user?.mobile).then((response) => {
          // console.log(true);
        })

        // console.log(req.session.user);
        // console.log(req.session.user?.mobile);
        res.redirect('/');
      } else {
        let err = 'Invalid password'
        res.render('user/login', { mobile, err })
      }
    })
  },
  getLogout: (req, res) => {

    userHelpers.inActive(req.session.user?.mobile).then((response) => {
      // console.log(true);
    })

    req.session.login=false;
    req.session.user=false;
    boo = true;
    res.redirect('/');
  },
  getContact: (req, res) => {
    res.render('user/contact', { userd })
  },
  getWishlist: (req, res) => {
    let userMob = req.session.user.mobile
    let userID = req.session.user;

    userHelpers.getAllWishlist(userMob).then((wishArr) => {
      // console.log(wishArr);
      res.render('user/wishlist', { userd, wishArr, userID })
    })

  },
  getCart: (req, res) => {
    let userMob = req.session.user.mobile
    let userID = req.session.user;
    userHelpers.getAllCart(userMob).then((cartArr) => {
      res.render('user/cart', { userd, cartArr, userID })
    })
  },
  getAddToWishlist: (req, res) => {
    let proId = req.params.id;
    let user = req.session.user.mobile;
    userHelpers.addWishlist(proId, user).then((resp) => {
      // console.log(true);
      res.redirect('/')
    })
  },
  getWishlistRemove: (req, res) => {
    let proId = req.params.id
    let user = req.session.user.mobile;

    userHelpers.removeWishlist(proId, user).then(() => {
      res.redirect('/wishlist')
    })
  },
  getAddCart: (req, res) => {
    let proId = req.params.id
    // console.log(req.originalUrl);
    // console.log(slug);
    let userMob = req.session.user.mobile

    userHelpers.addCart(userMob, proId).then((obj) => {
      obj.user = req.session.login
      req.session.user.cartNum = obj.cart
      if (obj.wish) {
        // res.redirect('/wishlist')
        res.json({ status: true, cart: obj.cart, user: obj.user })
      } else {
        // res.redirect('/cart')
        res.json({ status: true, cart: obj.cart, user: obj.user })
      }
    })
  },
  getCartRemove: (req, res) => {
    let proId = req.params.id
    let user = req.session.user.mobile;
    req.session.user.cartNum = Number(req.session.user.cartNum)-1
    userHelpers.removeCart(proId, user).then(() => {
      res.redirect('/cart')
    })
  },
  getBlog: (req, res) => {
    res.render('user/blog', { userd })
  },
  getSingleBlog: (req, res) => {
    res.render('user/single-blog', { userd })
  },
  getSingleProductId: (req, res) => {
    // const slug = (req.originalUrl).split('/').pop();
    let proId = req.params.slug
    let userID = req.session.user;
    console.log(req.body.stat);
    if (req.body.stat === 'rate' && userID) {
      userID.rate = true
    }
    if (req.body.stat ===undefined && userID) {
      userID.rate = false
    }
    userHelpers.getSingleProduct(proId).then((arr) => {
      let product = arr[0]
      let category = arr[1]
      let stock = arr[2]
      let review = arr[3]
      let total = review.reduce((accumulator, currentValue) => accumulator + (currentValue.rating), 0);
      let avg = Math.ceil(total/review.length)
      let stk = Number(stock)
      if (stk < 10 && stk != 0) {
        var stks = true
      } else {
        var stks = false
      }
      // console.log(userd);
      product.price = product.price.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        currencyDisplay: 'symbol',
        minimumFractionDigits: 2
      })
      res.render('user/single-product', { userd, product, category, stock, userID, stks ,review,avg})
    })
  },
  getAccount: (req, res) => {
    let userID = req.session.user;
    userHelpers.getAccDetails(userID.mobile).then((user) => {
      // console.log(user);
      res.render('user/account-details', { userd, userID, user })

    })

  },
  postUpdateAc: (req, res) => {
    let userID = req.session.user;
    let user= userID
    let image = req.files[0]
    const regex = /\.jpg$/;

      req.session.user.username = req.body.name
      userHelpers.updateAc(req.body, userID.mobile, image).then((resp) => {
        res.redirect('/account')
      })
   
     
     
    
  },
  postChangePass: (req, res) => {
    let userID = req.session.user;
    let user = userID
    userHelpers.updatePass(req.body, userID.mobile).then((status) => {
      if (status) {
        res.render('user/account-details', { pass: true, userd, userID, user })
      } else {
        res.render('user/account-details', { passNo: true, userd, userID, user })

      }
    })
  },
  getAddresses: (req, res) => {
    let userID = req.session.user;
    userHelpers.getAllAddress(userID.mobile).then((add) => {
      res.render('user/addresses', { userd, userID, add })

    })
  },
  getAddAddresses: (req, res) => {
    let userID = req.session.user;
    let check = req.query.check
    res.render('user/add-address', { userd, userID, check })

  },
  postAddress: (req, res) => {
    let userID = req.session.user;
    let ind = req.query.ind
    let check = req.query.check

    if (ind) {
      userHelpers.addAddress(req.body, userID, ind).then((resp) => {
        if (check == 1) {
          res.redirect('/checkout')

        } else {
          res.redirect('/addresses')

        }
      })
    } else {
      userHelpers.addAddress(req.body, userID).then((resp) => {
        if (check == 1) {
          res.redirect('/cart')

        } else {
          res.redirect('/addresses')

        }
      })

    }


  },
  getEditAddressId: (req, res) => {
    let index = req.query.ind
    let userID = req.session.user;
    userHelpers.editAddress(index, userID.mobile).then((add) => {
      res.render('user/add-address', { userd, userID, add, index })

    })
  },
  getDeleteAddressId: (req,res) => {
    let ind = req.params.ind
    let userID = req.session.user;
    userHelpers.deleteAddress(ind, userID.mobile).then(()=>{
      res.redirect('/addresses')
    })

  },
  getCheckout: (req, res) => {
    let userID = req.session.user;
    let qty = req.query.qty
    let size = req.query.size

    userHelpers.getAddCheckout(userID.mobile, qty,size).then((array) => {
      let add = array[0]
      let docs = array[1]
      let coupon = array[2]
      

      res.render('user/checkout', { userID, userd, add, docs ,coupon})

    })
  },
  getCouponCheck: (req, res) => {
    let userID = req.session.user;
    let code = req.query.code
    let total = req.query.total
    userHelpers.checkCoupon(code, total, userID.mobile).then((discount) => {
      // console.log(discount);
      if (discount) {
        res.json({ status: true })

      } else {
        res.json({ status: false })

      }
    })

  },
  getCashOrder: (req, res) => {
    let discount = req.query.discount;
    let total = req.query.total;
    let addr = req.query.addr;
    req.session.user.cartNum = 0
    let userID = req.session.user;
    userHelpers.addCashOrder(discount, total, userID.mobile, addr).then(() => {
      res.redirect('/orders')
    }).catch((response)=>{
      res.redirect('/add-address')
    })
  },
  getPayOrder: (req, res) => {
    let discount = req.query.discount;
    let total = req.query.total;
    let addr = req.query.addr;
    let userID = req.session.user;
    userHelpers.addPayOrder(discount, total, userID.mobile, addr).then((orderId) => {
      userHelpers.generateRazorPay(orderId, total).then((order) => {
        res.json({order:order,status:false})

      })
    }).catch((response)=>{
      res.json({status:true})
    })
  },
  getOrders: (req, res) => {
    
    let userID = req.session.user;
    let paid = req.query.paid;
    let id = req.query.id;
    paypalHelpers.paidPaypalOrder(paid,id).then(()=>{
      
      userHelpers.getAllOrders(userID.mobile).then((orders) => {
        
        orders.map((order) => {
          order.createdOn = order.createdOn.toLocaleDateString('es-ES')
          order.count = order.products.length - 1
        })
        res.render('user/orders', { userID, userd, orders })
      })
    })
  },
  getOrderInfo: (req, res) => {
    let userID = req.session.user;
    let id = req.query.id
    userHelpers.getOneOrder(id).then((order) => {

      let orderNumber = id
      let l = orderNumber.length
      orderNumber = `${orderNumber[0]}${orderNumber[1]}${orderNumber[2]}${orderNumber[l - 2]}${orderNumber[l - 1]}`
      order[0].createdOn = order[0].createdOn.toLocaleDateString('es-ES')
      let status = order[0].status
      let del = false;
      if (status=='Delivered') {
        del=true;
        order.map((ord)=>{
          ord.stat = true;
        })
      }
      res.render('user/order-info', { userID, userd, order, orderNumber,del })
    })
  },
  getCancelOrderId: (req, res) => {
    let id = req.params.id
    userHelpers.cancelOrder(id).then((resp) => {
      req.session.user.wallet = Number(resp)+Number(req.session.user.wallet)
      res.redirect('/orders')
    })
  },
  postVerifyPayment: (req, res) => {
    userHelpers.verifyPayment(req.body).then(() => {
      userHelpers.changePayStatus(req.body['order[receipt]']).then(() => {
        req.session.user.cartNum = 0
        res.json({ status: true })
      })
    }).catch((err) => {
      console.log(err)
      res.json({ status: false })
    })

  },
  getReturnOrderId: (req, res) => {
    let id = req.params.id
    userHelpers.returnOrder(id).then(() => {
      res.redirect('/orders')
    })
  },
  getAllProducts: (req, res) => {
    let userID = req.session.user;
    productHelpers.getAllProducts().then((array) => {
      let products = array[1]
      products.map((product) => {
        product.price = product.price.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
          currencyDisplay: 'symbol',
          minimumFractionDigits: 2
        })
      })
      res.render('user/all-products', { products, userd, userID })
    })
  },
  getHer: (req, res) => {
    let userID = req.session.user;
    productHelpers.getHerProducts().then((products) => {
      res.render('user/all-products', { products, userd, userID })
    })
  },
  getHim: (req, res) => {
    let userID = req.session.user;
    productHelpers.getHimProducts().then((products) => {
      res.render('user/all-products', { products, userd, userID })
    })
  },
  getPaypalOrder:(req,res)=>{
    let discount = req.query.discount;
    let total = req.query.total;
    let addr = req.query.addr;
    let userID = req.session.user;
    console.log(discount,total);
    paypalHelpers.addPaypalOrder(discount, total, userID.mobile, addr).then((id)=>{
      paypalHelpers.payWithPaypal(id,res,total)
    }).catch((response)=>{
      res.redirect('/add-address')
    })
  },
  getlowtohigh:(req,res)=>{
    let userID = req.session.user;
    productHelpers.getLtoHProducts().then((products) => {
      res.render('user/all-products', { products, userd, userID })
    })
  },
  gethightolow:(req,res)=>{
    let userID = req.session.user;
    productHelpers.getHtoLProducts().then((products) => {
      res.render('user/all-products', { products, userd, userID })
    })
  },
  postSearch: (req,res)=>{
    let search = req.body.search;
    let userID = req.session.user;
    couponHelpers.getSearch(search).then((products)=>{
      res.render('user/all-products', { products, userd, userID })
    })
  },
  postAddReview: (req,res) =>{
    couponHelpers.postReview(req.body).then(()=>{
      let slug = req.body.slug
    res.redirect(`/single-product/${slug}`)
    })
  }
}