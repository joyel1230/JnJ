const { response } = require('express');
var express = require('express');
var router = express.Router();
const userHelpers=require('../helpers/user-helpers');
var count=1;
var boo;
/* GET home page. */
router.get('/', function(req, res, next) {
  let userID=req.session.user;
  if (userID) {
    if (count===1) {
     var pop=true
      count++;
    }
  }else{
   count=1;
  }
  console.log(count);
  res.render('user/index', {user:1,userID,pop,boo});
  boo=false;
});

/* login */

router.get('/login',(req,res)=>{
  if (req.session.login) {
    res.redirect('/');
  }else{
  res.render('user/mobile')
  }
})

router.get('/password',(req,res)=>{
  if (req.session.login) {
    res.redirect('/');
  }else{
  userHelpers.validUser(req.query.mobile).then((valid)=>{
    var newMobile=req.query.mobile
    if (valid) {
      var mobile=valid.mobile;
      res.render('user/login',{mobile});
      } else {
      res.render('user/forgot',{newMobile});
      }
  })
}
})

router.get('/password/:id',(req,res)=>{
    var newMobile=req.params.id
    if (req.session.user) {
      res.redirect('/')
    }else{
      res.render('user/forgot',{newMobile});
    }
})


router.post('/password',(req,res)=>{
  var mobile=req.body.mobile;
  if (req.session.login) {
    res.redirect('/');
  }else{
  userHelpers.doSignup(req.body).then((response)=>{
    res.render('user/login',{mobile,pop:true})
  })
}
})



router.post('/login/:id',(req,res)=>{
  // console.log(req.body);
  let id=req.params.id;
  let mobile=id;
  let pass=req.body.password;
  userHelpers.doLogin(id,pass).then((response)=>{
    if (response.status) {
      req.session.login=true;
      req.session.user=response.user;
      res.redirect('/');
    }else{
      let err='Invalid password'
      res.render('user/login',{mobile,err})
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy();
  boo=true;
  res.redirect('/');
})



module.exports = router;
