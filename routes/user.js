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



module.exports = router;
