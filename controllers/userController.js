require('dotenv').config()

const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
let count = 1;
let boo;
const userd = true;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const myNumber = process.env.TWILIO_MY_NUMBER;
const myOTP = process.env.TWILIO_MY_OTP;
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
    let userID = req.session.user;
    return new Promise((resolve, reject) => {
      productHelpers.getAllProducts().then((array) => {
        let products = array[1]
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

          res.render('user/index', { userd, userID, pop, boo, products });
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

          // client.messages
          //   .create({
          //     body: myOTP,
          //     from: myNumber,
          //     to: mob
          //   })
          //   .then(message => console.log(message.sid));


          res.render('user/forgot', { newMobile });
        }
      })
    }
  },
  getPasswordId: (req, res) => {
    var newMobile = req.params.id
    if (req.session.user) {
      res.redirect('/')
    } else {
      res.render('user/forgot', { newMobile });
    }
  },
  postPassword: (req, res) => {
    var mobile = req.body.mobile;
    if (req.session.login) {
      res.redirect('/');
    } else {
      userHelpers.doSignup(req.body).then((response) => {
        res.render('user/login', { mobile, pop: true })
      })
    }
  },
  postLoginId: (req, res) => {
    let id = req.params.id;
    let mobile = id;
    let pass = req.body.password;
    userHelpers.doLogin(id, pass).then((response) => {
      if (response.status) {
        req.session.login = true;
        req.session.user = response.user;

        userHelpers.active(req.session.user?.mobile).then((response) => {
          console.log(true);
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

    req.session.destroy();
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
      res.render('user/wishlist', { userd, wishArr , userID })
    })

  },
  getCart: (req, res) => {
    let userMob = req.session.user.mobile
    let userID = req.session.user;
    userHelpers.getAllCart(userMob).then((cartArr) => {
      res.render('user/cart', { userd, cartArr,userID })
    })
  },
  getAddToWishlist: (req, res) => {
    let proId = req.params.id;
    let user = req.session.user.mobile;
    userHelpers.addWishlist(proId, user).then((resp) => {
      console.log(true);
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
    let userMob = req.session.user.mobile
    userHelpers.addCart(userMob, proId).then((wish) => {
      if (wish) {
        // res.redirect('/wishlist')
        res.json({status:true})
      } else {
        // res.redirect('/cart')
      }
    })
  },
  getCartRemove: (req, res) => {
    let proId = req.params.id
    let user = req.session.user.mobile;
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
    let proId = req.query.id
    userHelpers.getSingleProduct(proId).then((arr) => {
      let product =arr[0]
      let category =arr[1]
      let stock = arr[2]
      console.log(userd);
      res.render('user/single-product', { userd,product,category,stock})
    })
  }

}