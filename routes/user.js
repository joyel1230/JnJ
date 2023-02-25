const { response } = require('express');
var express = require('express');
var router = express.Router();
const userHelpers=require('../helpers/user-helpers');

/* GET home page. */
router.get('/', function(req, res, next) {
  let userID=req.session.user;
  res.render('user/index', {user:1,userID});
});

/* login */

router.get('/login',(req,res)=>{
  res.render('user/mobile')
})

router.get('/password',(req,res)=>{
  userHelpers.validUser(req.query.mobile).then((valid)=>{
    var newMobile=req.query.mobile
    if (valid) {
      var mobile=valid.mobile;
      res.render('user/login',{mobile});
      } else {
      res.render('user/forgot',{newMobile});
      }
  })
})

router.get('/password/:id',(req,res)=>{
    var newMobile=req.params.id
      res.render('user/forgot',{newMobile});
})


router.post('/password',(req,res)=>{
  console.log(req.body);
  var mobile=req.body.mobile;
  console.log(mobile);
  userHelpers.doSignup(req.body).then((response)=>{
    res.render('user/login',{mobile})
  })
})



router.post('/login/:id',(req,res)=>{
  // console.log(req.body);
  let id=req.params.id;
  let pass=req.body.password;
  userHelpers.doLogin(id,pass).then((response)=>{
    if (response.status) {
      req.session.login=true;
      req.session.user=response.user;
      res.redirect('/');
    }else{
      res.redirect('/login');
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy();
  res.redirect('/');
})



module.exports = router;
