const productHelpers = require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers')

module.exports = {
    verifyLogin: (req, res, next) => {
        if (req.session.admin) {
            next();
        } else {
            res.redirect('/admin/login');
        }
    },
    getHome: (req, res, next) => {
        if (req.session.admin) {
            res.render('admin/admin-home')
        } else {
            res.redirect('/admin/login');
        }
    },
    getLogin: (req, res) => {
        if (req.session.admin) {
            res.redirect('/admin');
        } else {
            res.render('admin/admin-login')
        }
    },
    postLogin: (req, res, next) => {
        if (req.body.email === "admin@gmail.com" && req.body.password === "123") {
            req.session.admin = true
            res.redirect('/admin')
        } else {
            msg = true
            res.render('admin/admin-login', { msg })
        }
    },
    getLogout: (req, res, next) => {
        req.session.admin = false
        res.redirect('/admin/login')
    },
    getProducts: (req, res, next) => {
        productHelpers.getAllProducts().then((products) => {
            res.render('admin/admin-products', { products })
        })
    },
    getAddProduct: (req, res, next) => {
        res.render('admin/admin-add-product')
    },
    postAddProduct: (req, res) => {
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
    },
    getDeleteProductId: (req, res) => {
        let proId = req.params.id
        productHelpers.deleteProduct(proId).then((response) => {
            res.redirect('/admin/products')
        })
    },
    getEditProductId: async (req, res) => {
        let product = await productHelpers.getProductDetails(req.params)
        res.render('admin/admin-edit-product', { product })
    },
    postEditProductId: (req, res) => {
        _id = req.params.id
        productHelpers.updateProduct(_id, req.body).then(() => {
            res.redirect('/admin/products')
            let image = req.files?.image
            if (image) {
                image.mv('./public/images/products/' + _id + '.jpg')
            }
        })
    },
    //   user
    getUsers: (req, res, next) => {
        userHelpers.getAllUsers().then((users) => {
            res.render('admin/admin-users', { users })
        })
    },
    getEditUserId: async (req, res) => {
        let product = await userHelpers.getUserDetails(req.params)
        res.render('admin/admin-edit-user', { product })
    },
    postEditUserId: (req, res) => {
        _id = req.params.id
        userHelpers.updateUser(_id, req.body).then(() => {
            res.redirect('/admin/users')
        })
    },
    getDeleteUserId: (req, res) => {
        let proId = req.params.id
        userHelpers.deleteUser(proId).then((response) => {
            res.redirect('/admin/users')
        })
    },
    getGetUser: (req, res) => {
        userHelpers.getUsers(req.query.user).then((users) => {
            res.render('admin/admin-users', { users })
        })
    },
    getGetProduct: (req, res) => {
        userHelpers.getProducts(req.query.product).then((products) => {
            res.render('admin/admin-products', { products })
        })
    },
    getBlockUserId: (req, res) => {
        let id = req.params.id
        userHelpers.blockUser(id).then((response) => {
            res.redirect('/admin/users')
        })
    },
    getUnblockUserId: (req, res) => {
        let id = req.params.id
        userHelpers.unblockUser(id).then((response) => {
            res.redirect('/admin/users')
        })
    }

}