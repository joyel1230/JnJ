var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('admin/admin-home')
});

router.get('/products', function (req, res, next) {
  productHelpers.getAllProducts().then((products) => {
    res.render('admin/admin-products', {products})
  })
})

router.get('/add-product', function (req, res, next) {
  res.render('admin/admin-add-product')
})

router.post('/add-product', (req, res) => {
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.image;
    image.mv('./public/images/products/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render('admin/admin-add-product')
      } else {
        console.log(err);
      }
    })
  })
})
module.exports = router;
