const userHelpers = require('../helpers/user-helpers');
let count = 1;
let boo;


module.exports = {
    verifyLogin:(req, res, next) => {
        if (req.session.login) {
          next();
        } else {
          res.redirect('/login');
        }
      },
      getHome:(req, res, next)=>{
        let userID = req.session.user;
        console.log(userID);
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
      
          res.render('user/index', { user: 1, userID, pop, boo });
          boo = false;
        }
      },
      getLogin:(req, res) => {
        if (req.session.login) {
          res.redirect('/');
        } else {
          res.render('user/mobile')
        }
      },
      getPassword:(req, res) => {
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
              res.render('user/forgot', { newMobile });
            }
          })
        }
      },
      getPasswordId:(req, res) => {
        var newMobile = req.params.id
        if (req.session.user) {
          res.redirect('/')
        } else {
          res.render('user/forgot', { newMobile });
        }
      },
      postPassword:(req, res) => {
        var mobile = req.body.mobile;
        if (req.session.login) {
          res.redirect('/');
        } else {
          userHelpers.doSignup(req.body).then((response) => {
            res.render('user/login', { mobile, pop: true })
          })
        }
      },
      postLoginId:(req, res) => {
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
      
            console.log(req.session.user);
            console.log(req.session.user?.mobile);
            res.redirect('/');
          } else {
            let err = 'Invalid password'
            res.render('user/login', { mobile, err })
          }
        })
      },
      getLogout:(req, res) => {

        userHelpers.inActive(req.session.user?.mobile).then((response) => {
          console.log(true);
        })
      
        req.session.destroy();
        boo = true;
        res.redirect('/');
      },


}