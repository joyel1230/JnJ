const express = require("express");
const router = express.Router();
const adminCont = require("../controllers/adminController");
const { route } = require("./user");

router.get("/", adminCont.getHome);

router.get("/login", adminCont.getLogin);

router.post("/login", adminCont.postLogin);

router.get("/logout", adminCont.getLogout);

// products

router.get("/products", adminCont.verifyLogin, adminCont.getProducts);

router.get("/add-product", adminCont.verifyLogin, adminCont.getAddProduct);

router.post("/add-product", adminCont.verifyLogin, adminCont.postAddProduct);

router.get(
  "/delete-product/:id",
  adminCont.verifyLogin,
  adminCont.getDeleteProductId
);

router.get(
  "/edit-product/:id",
  adminCont.verifyLogin,
  adminCont.getEditProductId
);

router.post(
  "/edit-product/:id",
  adminCont.verifyLogin,
  adminCont.postEditProductId
);

router.post("/add-category", adminCont.verifyLogin, adminCont.postAddCategory);

router.post(
  "/edit-category",
  adminCont.verifyLogin,
  adminCont.postEditCategory
);

// users

router.get("/users", adminCont.verifyLogin, adminCont.getUsers);

router.get("/edit-user/:id", adminCont.verifyLogin, adminCont.getEditUserId);

router.post("/edit-user/:id", adminCont.verifyLogin, adminCont.postEditUserId);

// router.get('/delete-user/:id', adminCont.verifyLogin, adminCont.getDeleteUserId)

router.get("/search-user", adminCont.verifyLogin, adminCont.getGetUser);

router.get("/search-mobile", adminCont.verifyLogin, adminCont.postSearchMobile);

router.get("/search-email", adminCont.verifyLogin, adminCont.postSearchEmail);

router.get(
  "/search-order-date",
  adminCont.verifyLogin,
  adminCont.getSearchOrderDate
);

router.get("/get-product", adminCont.verifyLogin, adminCont.getGetProduct);

router.get("/block-user/:id", adminCont.verifyLogin, adminCont.getBlockUserId);

router.get(
  "/unblock-user/:id",
  adminCont.verifyLogin,
  adminCont.getUnblockUserId
);

// orders

router.get("/orders", adminCont.verifyLogin, adminCont.getAllOrders);

router.get("/order-info", adminCont.verifyLogin, adminCont.getOneOrder);

router.get(
  "/cancel-order/:id",
  adminCont.verifyLogin,
  adminCont.getCancelOrderId
);

router.get(
  "/deliver-order/:id",
  adminCont.verifyLogin,
  adminCont.getDeliverOrderId
);

router.get(
  "/return-order/:id",
  adminCont.verifyLogin,
  adminCont.getReturnOrderId
);

// coupons

router.get("/coupons", adminCont.verifyLogin, adminCont.getCoupons);

router.post("/coupons", adminCont.verifyLogin, adminCont.postCoupons);

router.get("/banners", adminCont.verifyLogin, adminCont.getBanners);

router.post("/banners", adminCont.verifyLogin, adminCont.postBanners);

router.get(
  "/select-banner",
  adminCont.verifyLogin,
  adminCont.getSelectBannerId
);

module.exports = router;
