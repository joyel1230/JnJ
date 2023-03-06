const express = require('express');

const productHelpers = require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers')
require('dotenv').config()



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
        if (req.body.email === process.env.ADMIN_EMAIL && req.body.password === process.env.ADMIN_KEY) {
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
        productHelpers.getAllProducts().then((array) => {
            category=array[0]
            products=array[1]
            // for(let a of products){
            //     a.categoryAs = a.categoryAs[0].category
            // }
            res.render('admin/admin-products', { category,products})
        })
    },
    getAddProduct: (req, res, next) => {
        productHelpers.getCategory().then((category) => {
            res.render('admin/admin-add-product', { category })
        })
    },
    postAddProduct: (req, res) => {
        console.log(req.body.category);
        productHelpers.addProduct(req.body, (id) => {
            let image = req.files.image;
            let a=0;
            for (let i = 0; i < image.length; i++) {
                image[i].mv('./public/images/products/' + id +'_'+a+'.jpg', (err, done) => {
                    if (!err) {
                        
                    } else {
                        console.log(err);
                    }
                })
                a++;
            }
            res.render('admin/admin-add-product')
            
        })
    },
    getDeleteProductId: (req, res) => {
        let proId = req.params.id
        productHelpers.deleteProduct(proId).then((response) => {
            res.redirect('/admin/products')
        })
    },
    getEditProductId: async (req, res) => {
        let array = await productHelpers.getProductDetails(req.params)
       let category=array[0];
       let product=array[1];
        res.render('admin/admin-edit-product', { category,product })
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
    postAddCategory: (req, res) => {
        let cat = req.body.name
        productHelpers.addCategory(cat).then(() => {
            res.redirect('/admin/products')
        })
    },
    postEditCategory:(req,res)=>{
        let first =req.body.category
        let newOne=req.body.editedCat
        productHelpers.editCategory(first,newOne).then(()=>{
            res.redirect('/admin/products')
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