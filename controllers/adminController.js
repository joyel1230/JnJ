const express = require("express");

const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");
const couponHelpers = require("../helpers/coupon-helpers");
const reportHelpers = require("../helpers/report-helpers");
require("dotenv").config();

module.exports = {
  verifyLogin: (req, res, next) => {
    if (req.session.admin) {
      next();
    } else {
      res.redirect("/admin/login");
    }
  },
  getHome: (req, res, next) => {
    try {
      if (req.session.admin) {
        reportHelpers
          .getTotalSales()
          .then(async (objR) => {
            objR.todaySale = await currency(objR.todaySale);
            objR.margin = await currency(objR.margin);

            res.render("admin/admin-home", { objR });
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        res.redirect("/admin/login");
      }
      function currency(cur) {
        cur = cur.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
          currencyDisplay: "symbol",
          minimumFractionDigits: 0,
        });
        return cur;
      }
    } catch (err) {
      console.error(err);
    }
  },
  getLogin: (req, res) => {
    try {
      if (req.session.admin) {
        res.redirect("/admin");
      } else {
        res.render("admin/admin-login");
      }
    } catch (err) {
      console.error(err);
    }
  },
  postLogin: (req, res, next) => {
    if (
      req.body.email === process.env.ADMIN_EMAIL &&
      req.body.password === process.env.ADMIN_KEY
    ) {
      req.session.admin = true;
      res.redirect("/admin");
    } else {
      msg = true;
      res.render("admin/admin-login", { msg });
    }
  },
  getLogout: (req, res, next) => {
    req.session.admin = false;
    res.redirect("/admin/login");
  },
  getProducts: (req, res, next) => {
    productHelpers.getAllProducts().then((array) => {
      category = array[0];
      products = array[1];
      // for(let a of products){
      //     a.categoryAs = a.categoryAs[0].category
      // }
      res.render("admin/admin-products", { category, products });
    });
  },
  getAddProduct: (req, res, next) => {
    productHelpers
      .getCategory()
      .then((category) => {
        res.render("admin/admin-add-product", { category });
      })
      .catch((err) => {
        console.log(err);
      });
  },
  postAddProduct: (req, res) => {
    try {
      let image = req.files;
      // console.log(image);

      productHelpers.addProduct(req.body, image, (id) => {
        res.redirect("/admin/products");
      });
    } catch (err) {
      console.error(err);
    }
  },
  getDeleteProductId: (req, res) => {
    try {
      let proId = req.params.id;
      productHelpers
        .deleteProduct(proId)
        .then((response) => {
          res.redirect("/admin/products");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  getEditProductId: async (req, res) => {
    try {
      let array = await productHelpers.getProductDetails(req.params);
      let category = array[0];
      let product = array[1];
      res.render("admin/admin-edit-product", { category, product });
    } catch (err) {
      console.error(err);
    }
  },
  postEditProductId: (req, res) => {
    try {
      let _id = req.params.id;
      let image = req.files[0];
      productHelpers
        .updateProduct(_id, req.body, image)
        .then(() => {
          res.redirect("/admin/products");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  postAddCategory: (req, res) => {
    try {
      let cat = req.body.name;
      productHelpers
        .addCategory(cat)
        .then(() => {
          res.redirect("/admin/products");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  postEditCategory: (req, res) => {
    try {
      let first = req.body.category;
      let newOne = req.body.editedCat;
      productHelpers
        .editCategory(first, newOne)
        .then(() => {
          res.redirect("/admin/products");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },

  //   user

  getUsers: (req, res, next) => {
    userHelpers
      .getAllUsers()
      .then((users) => {
        res.render("admin/admin-users", { users });
      })
      .catch((err) => {
        console.log(err);
      });
  },
  getEditUserId: async (req, res) => {
    try {
      let product = await userHelpers.getUserDetails(req.params);
      res.render("admin/admin-edit-user", { product });
    } catch (err) {
      console.error(err);
    }
  },
  postEditUserId: (req, res) => {
    try {
      _id = req.params.id;
      userHelpers
        .updateUser(_id, req.body)
        .then(() => {
          res.redirect("/admin/users");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  getDeleteUserId: (req, res) => {
    try {
      let proId = req.params.id;
      userHelpers
        .deleteUser(proId)
        .then((response) => {
          res.redirect("/admin/users");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  getGetUser: (req, res) => {
    try {
      let search = 1;
      userHelpers
        .getUsers(req.query.query1, search)
        .then((users) => {
          res.render("admin/admin-users", { users });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  postSearchMobile: (req, res) => {
    try {
      let search = 2;
      userHelpers
        .getUsers(req.query.query2, search)
        .then((users) => {
          res.render("admin/admin-users", { users });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  postSearchEmail: (req, res) => {
    try {
      let search = 3;
      userHelpers
        .getUsers(req.query.query3, search)
        .then((users) => {
          res.render("admin/admin-users", { users });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  getGetProduct: (req, res) => {
    try {
      userHelpers
        .getProducts(req.query.product)
        .then((products) => {
          res.render("admin/admin-products", { products });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  getBlockUserId: (req, res) => {
    try {
      let id = req.params.id;
      userHelpers
        .blockUser(id)
        .then((response) => {
          res.redirect("/admin/users");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  getUnblockUserId: (req, res) => {
    try {
      let id = req.params.id;
      userHelpers
        .unblockUser(id)
        .then((response) => {
          res.redirect("/admin/users");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  getCoupons: (req, res) => {
    try {
      couponHelpers
        .getAllCoupon()
        .then((coupons) => {
          coupons.map((coupon) => {
            coupon.expiry = coupon.expiry.toLocaleDateString("es-ES");
          });
          res.render("admin/admin-coupons", { coupons });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  postCoupons: (req, res) => {
    try {
      let body = req.body;
      couponHelpers
        .addCoupons(body)
        .then((resp) => {
          res.redirect("/admin/coupons");
          // console.log(resp);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  getAllOrders: (req, res) => {
    try {
      productHelpers
        .getAllOrders()
        .then((orders) => {
          orders.map((order) => {
            order.createdOn = order.createdOn.toLocaleDateString("es-ES");
          });
          res.render("admin/admin-orders", { orders });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  getOneOrder: (req, res) => {
    try {
      let id = req.query.id;
      productHelpers
        .getOneOrderId(id)
        .then((order) => {
          let orderNumber = id;
          let l = orderNumber.length;
          orderNumber = `${orderNumber[0]}${orderNumber[1]}${orderNumber[2]}${
            orderNumber[l - 2]
          }${orderNumber[l - 1]}`;
          order[0].createdOn = order[0].createdOn.toLocaleDateString("es-ES");
          res.render("admin/admin-order-info", { order, orderNumber });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  getCancelOrderId: (req, res) => {
    try {
      let id = req.params.id;
      userHelpers
        .cancelOrder(id)
        .then((resp) => {
          res.redirect("/admin/orders");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  getDeliverOrderId: (req, res) => {
    try {
      let id = req.params.id;
      userHelpers
        .deliverOrder(id)
        .then((resp) => {
          res.redirect("/admin/orders");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  getBanners: (req, res) => {
    try {
      userHelpers
        .getAllBanners()
        .then((banners) => {
          res.render("admin/admin-banners", { banners });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  postBanners: (req, res) => {
    try {
      // console.log(req);
      let image = req.files[0];
      let description = req.body.description;
      userHelpers
        .addBanners(image, description)
        .then((resp) => {
          res.redirect("/admin/banners");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  getSelectBannerId: (req, res) => {
    try {
      let id = req.query.id;
      // console.log(id);
      userHelpers
        .selectBanner(id)
        .then((banner) => {
          // res.redirect('/admin/banners')
          res.json({ status: true });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  getReturnOrderId: (req, res) => {
    try {
      let id = req.params.id;
      userHelpers
        .returnedOrder(id)
        .then(() => {
          res.redirect("/admin/orders");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
  getSearchOrderDate: (req, res) => {
    try {
      userHelpers
        .getOrderDate(req.query.date)
        .then((orders) => {
          orders.map((order) => {
            order.createdOn = order.createdOn.toLocaleDateString("es-ES");
          });
          res.render("admin/admin-orders", { orders });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  },
};
