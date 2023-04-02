const db = require('../config/connection');
const collections = require('../config/collections');
const bcrypt = require('bcrypt');
const { response } = require('express');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const Razorpay = require('razorpay')
var { validatePaymentVerification } = require('../node_modules/razorpay/dist/utils/razorpay-utils');
const userHelpers = require('../helpers/user-helpers');
const reportHelpers = require('../helpers/report-helpers');




var instance = new Razorpay({
    key_id: process.env.RAZ_KEY_ID,
    key_secret: process.env.RAZ_KEY_SECRET,
});


module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10);
            let user = await db.get().collection(collections.USER_COLLECTIONS).findOne({ mobile: userData.mobile })
            if (user) {
                await db.get().collection(collections.USER_COLLECTIONS).updateOne({ mobile: user.mobile }, { $set: { password: userData.password } })
                resolve(user)
            } else {
                let data = await db.get().collection(collections.USER_COLLECTIONS).insertOne({
                    mobile: userData.mobile,
                    password: userData.password
                })
                resolve(data)
            }
        })
    },
    doLogin: (mob, pass) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collections.USER_COLLECTIONS).findOne({ mobile: mob })
            let cart = await db.get().collection(collections.USER_COLLECTIONS).findOne({ mobile: mob })
            let cartN = cart.cart?.length
            
            if (user) {
                bcrypt.compare(pass, user.password).then((status) => {
                    if (status) {
                        console.log('login success');
                        response.user = user
                        response.status = true
                        response.cartNum = cartN
                        resolve(response)
                    } else {
                        console.log('login failed');
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('login failed');
                resolve({ status: false })
            }
        })
    },
    validUser: (mob) => {
        return new Promise(async (resolve, reject) => {
            let valid = await db.get().collection(collections.USER_COLLECTIONS).findOne({ mobile: mob })
            resolve(valid);
        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = db.get().collection(collections.USER_COLLECTIONS).find().toArray()
            resolve(users)
        })
    },
    deleteUser: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTIONS).updateOne({ _id: ObjectId(proId) },
                { $set: { deleted: true } }).then(() => {
                    resolve(true)
                })
        })
    },
    getUserDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTIONS).findOne({ _id: ObjectId(proId) }).then((product) => {
                resolve(product)
            })
        })
    },
    updateUser: (proId, userDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTIONS).updateOne({ _id: ObjectId(proId) },
                {
                    $set: {
                        username: userDetails.name,
                        email: userDetails.email
                    }
                }).then(() => {
                    resolve()
                })
        })
    },
    getUsers: (user, search) => {
        return new Promise(async (resolve, reject) => {
            // console.log(user);
            //    let users= await db.get().collection(collections.USER_COLLECTIONS).find({$text:{$search: user}}).toArray()
            //    let users= await db.get().collection(collections.USER_COLLECTIONS).find({name:{$regex:`^${user}`}}).toArray()
            let users;
            let regex = new RegExp(user, "i");

            if (search == 1) {
                users = await db.get().collection(collections.USER_COLLECTIONS).find({
                    $or: [
                        { username: { $regex: regex } }
                    ]
                }).toArray();

            } else if (search == 2) {
                users = await db.get().collection(collections.USER_COLLECTIONS).find({
                    $or: [
                        { mobile: { $regex: regex } }
                    ]
                }).toArray();
            } else {
                users = await db.get().collection(collections.USER_COLLECTIONS).find({
                    $or: [
                        { email: { $regex: regex } }
                    ]
                }).toArray();
            }
            // let users = await db.get().collection(collections.USER_COLLECTIONS).find({

            //         username: 'joyel'

            // }).toArray();

            console.log(users);


            // console.log(users);
            resolve(users)
        })
    },
    getProducts: (user) => {
        return new Promise(async (resolve, reject) => {
            // console.log(user);
            //    let users= await db.get().collection(collections.USER_COLLECTIONS).find({$or:[{$text:{$search: user}},{$match:{name:'0'}}]}).toArray()

            let regex = new RegExp(user, "i");
            let users = await db.get().collection(collections.PRODUCT_COLLECTIONS).find({
                $or: [
                    { name: { $regex: regex } },
                    { category: { $regex: regex } }
                ]
            }).toArray();


            //    let users= await db.get().collection(collections.PRODUCT_COLLECTIONS).find({name: /^user/}).toArray()
            // console.log(users);
            resolve(users)
        })
    },
    active: (mob) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.USER_COLLECTIONS).updateOne({ mobile: mob }, { $set: { active: true } })
            resolve(true)
        })
    },
    inActive: (mob) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.USER_COLLECTIONS).updateOne({ mobile: mob }, { $set: { active: false } })
            resolve(true)
        })
    },
    blockUser: (mob) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.USER_COLLECTIONS).updateOne({ mobile: mob }, { $set: { blocked: true } })
            resolve(true)
        })
    },
    unblockUser: (mob) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.USER_COLLECTIONS).updateOne({ mobile: mob }, { $set: { blocked: false } })
            resolve(true)
        })
    },
    addWishlist: (proId, user) => {
        return new Promise(async (resolve, reject) => {
            let checkWish = await db.get().collection(collections.USER_COLLECTIONS).findOne({ mobile: user, wishlist: { $in: [ObjectId(proId)] } })
            if (!checkWish) {
                db.get().collection(collections.USER_COLLECTIONS).updateOne({ mobile: user }, { $push: { wishlist: ObjectId(proId) } })
            }
            resolve(true)
        })
    },
    getAllWishlist: (userMob) => {
        return new Promise(async (resolve, reject) => {
            let wishArr = await db.get().collection(collections.USER_COLLECTIONS).aggregate([{ $match: { mobile: userMob } }, { $unwind: "$wishlist" }, { $lookup: { from: "product", localField: "wishlist", foreignField: "_id", as: "wishItems" } }]).toArray()
            let cart = []
            if (wishArr.length <= 0) {
                resolve(cart)
            }
            resolve(wishArr)
        })
    },
    removeWishlist: (proId, user) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTIONS).updateOne({ mobile: user }, { $pull: { wishlist: ObjectId(proId) } })
            resolve(true)
        })
    },
    addCart: (userMob, proId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collections.USER_COLLECTIONS).updateOne({ mobile: userMob }, { $pull: { wishlist: ObjectId(proId) } })

            let checkCart = await db.get().collection(collections.USER_COLLECTIONS).findOne({ mobile: userMob, cart: { $elemMatch: { proId: ObjectId(proId) } } })
            // console.log(checkCart);
            if (!checkCart) {
                db.get().collection(collections.USER_COLLECTIONS).updateOne({ mobile: userMob }, { $push: { cart: { proId: ObjectId(proId), qty: Number(1) } } })
            }
            let wish = await db.get().collection(collections.USER_COLLECTIONS).findOne({ mobile: userMob })
            wish = wish?.wishlist

            let cart = await db.get().collection(collections.USER_COLLECTIONS).findOne({ mobile: userMob })
            let cartN = cart.cart.length
            let obj = {}
            obj.cart = cartN
            obj.wish = null
            if (wish) {
                obj.wish = wish[0]
                resolve(obj)

            } else {
                resolve(obj)
            }

            // db.get().collection(collections.USER_COLLECTIONS).updateOne({mobile:userMob},{$unset:{wishlist:""}})
            // db.get().collection(collections.USER_COLLECTIONS).updateOne({mobile:userMob},{$set:{cart:wish}})
        })
    },
    getAllCart: (userMob) => {
        return new Promise(async (resolve, reject) => {


            let cartArr = await db.get().collection(collections.USER_COLLECTIONS).aggregate([{ $match: { mobile: userMob } }, { $unwind: "$cart" }, { $lookup: { from: "product", localField: "cart.proId", foreignField: "_id", as: "cartItems" } }]).toArray()
            // console.log(cartArr[0].cartItems[0].stock );
            let cart = []
            if (cartArr.length <= 0) {
                resolve(cart)
            }
            for (let i = 0; i < cartArr.length; i++) {
                if (!cartArr[i].cartItems[0].deleted) {
                    cart.push(cartArr[i])
                } else {
                    db.get().collection(collections.USER_COLLECTIONS).updateOne({ mobile: userMob }, { $pull: { cart: { proId: ObjectId(cartArr[i].cartItems[0]._id) } } })

                }
            }

            resolve(cart)
        })
    },
    removeCart: (proIdn, user) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTIONS).updateOne({ mobile: user }, { $pull: { cart: { proId: ObjectId(proIdn) } } })
            resolve(true)
        })
    },
    getSingleProduct: (proId) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collections.PRODUCT_COLLECTIONS).findOne({ slug: proId })
            let category = await db.get().collection(collections.CATEGORY_COLLECTION).findOne({ _id: ObjectId(product.categoryId) })
            let prod = product._id
            prod = prod.toString()
            let review = await db.get().collection(collections.RATING_COLLECTION).find({proId:prod}).toArray()
            console.log(prod);
            let stock = Number(product.stock)
            let arr = [product, category, stock,review]
            resolve(arr)
        })
    },
    updateAc: (body, mob, image) => {
        return new Promise(async (resolve, reject) => {
            if (!image) {
                await db.get().collection(collections.USER_COLLECTIONS).updateOne(
                    { mobile: mob },
                    {
                        $set: {
                            username: body.name,
                            email: body.email
                        }
                    })
            } else {
                await db.get().collection(collections.USER_COLLECTIONS).updateOne(
                    { mobile: mob },
                    {
                        $set: {
                            username: body.name,
                            email: body.email,
                            image: image.filename
                        }
                    })
            }
            resolve(true)

        })
    },
    getAccDetails: (mob) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collections.USER_COLLECTIONS).findOne({ mobile: mob })
            resolve(user)
        })
    },
    updatePass: (body, mob) => {
        return new Promise(async (resolve, reject) => {
            // console.log(body);
            let user = await db.get().collection(collections.USER_COLLECTIONS).findOne({ mobile: mob })
            // console.log(user);
            bcrypt.compare(body.currentPassword, user.password).then(async (status) => {
                if (status) {
                    let password = await bcrypt.hash(body.newPassword, 10);
                    db.get().collection(collections.USER_COLLECTIONS).updateOne(
                        { mobile: mob },
                        {
                            $set: {
                                password: password
                            }
                        })
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
        })
    },
    addAddress: (body, user, ind = -1) => {
        return new Promise(async (resolve, reject) => {

            await db.get().collection(collections.USER_COLLECTIONS).updateOne(
                { mobile: user.mobile },
                {
                    $push: {
                        address: body
                    }
                })
            if (ind >= 0) {
                await db.get().collection(collections.USER_COLLECTIONS).updateOne(
                    { mobile: user.mobile },
                    {
                        $unset: {
                            ['address.' + ind]: 1
                        }
                    })
                await db.get().collection(collections.USER_COLLECTIONS).updateOne(
                    { mobile: user.mobile },
                    {
                        $pull: {
                            address: {
                                $eq: null
                            }
                        }
                    }
                )
            }

            resolve(true)
        })
    },
    getAllAddress: (mob) => {
        return new Promise(async (resolve, reject) => {
            let add = await db.get().collection(collections.USER_COLLECTIONS).findOne({ mobile: mob })
            resolve(add.address)
        })
    },
    editAddress: (index, mob) => {
        return new Promise(async (resolve, reject) => {
            let add = await db.get().collection(collections.USER_COLLECTIONS).findOne({ mobile: mob })
            resolve(add.address[index])
        })
    },
    deleteAddress: (ind, mobile) => {
        return new Promise(async (resolve, reject) => {

            await db.get().collection(collections.USER_COLLECTIONS).updateOne(
                { mobile: mobile },
                {
                    $unset: {
                        ['address.' + ind]: 1
                    }
                })
            await db.get().collection(collections.USER_COLLECTIONS).updateOne(
                { mobile: mobile },
                {
                    $pull: {
                        address: {
                            $eq: null
                        }
                    }
                }
            )
            resolve(true)
        })
    },
    getAddCheckout: (mob, qty, size) => {

        let qtyArr = []
        qtyArr.push(...qty.split(','))
        qty = qtyArr;
        let sizeArr = []
        sizeArr.push(...size.split(','))
        size = sizeArr;
        // console.log(qty);
        return new Promise(async (resolve, reject) => {
            let add = await db.get().collection(collections.USER_COLLECTIONS).findOne({ mobile: mob })
            let coupon = await db.get().collection(collections.COUPON_COLLECTION).aggregate([
                {
                    $match:{
                           expiry:{$gte:new Date()}
                    }
                }
            ]).toArray()

            for (let i = 0; i < qty.length; i++) {
                updateQty(mob, qty[i], size[i], i)
            }
            async function updateQty(mob, qty, size, i) {
                qty = Number(qty)
                await db.get().collection(collections.USER_COLLECTIONS).updateOne(
                    { mobile: mob },
                    { $set: { [`cart.${i}.qty`]: qty, [`cart.${i}.size`]: size } })
            }
            setTimeout(() => {

            }, 2000)
            let cartArr = await db.get().collection(collections.USER_COLLECTIONS).aggregate
                ([{ $match: { mobile: mob } }, { $unwind: "$cart" },
                { $lookup: { from: collections.PRODUCT_COLLECTIONS, localField: "cart.proId", foreignField: "_id", as: "cartItems" } }]).toArray()
            if (add.address) {
                add = add.address
            }
            let array = [add, cartArr]
            array.push(coupon)
            db.get().collection(collections.USER_COLLECTIONS).updateOne({ mobile: mob }, {
                $set: {
                    discount: Number(0)
                }
            })
            resolve(array)
        })
    },
    checkCoupon: (code1, total, mob) => {
        return new Promise(async (resolve, reject) => {
            
            // let coupon = await db.get().collection(collections.COUPON_COLLECTION).findOne({ code: code })
            let coupon = await db.get().collection(collections.COUPON_COLLECTION).aggregate([
                {
                    $match:{
                           code:code1,expiry:{$gte:new Date()}
                    }
                }
            ]).toArray()
    
            if (coupon) {
                if (total >= coupon[0].minPur) {
                    await db.get().collection(collections.USER_COLLECTIONS).updateOne(
                        { mobile: mob }, {
                        $set: {
                            discount: Number(coupon[0].amount)
                        }
                    }
                    )
                    resolve(true)
                } else {
                    resolve(false)
                }
            } else {
                resolve(false)
            }
            resolve(false)
        })
    },
    addCashOrder: (discount, total, mob, addr) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collections.USER_COLLECTIONS).findOne({ mobile: mob })
            console.log(user.cart);
            console.log(user.cart[0].proId);
            if (!user.address) {
                reject(true)
            } else {
                if (user.address.length == 0) {
                    reject(true)
                } else {
                    db.get().collection(collections.ORDER_COLLECTION).insertOne({
                        userMobile: mob,
                        products: user.cart,
                        address: user.address[addr],
                        payMethod: 'COD',
                        discount: Number(discount),
                        total: Number(total),
                        createdOn: new Date(),
                        status: 'processing'
                    }).then(async (r) => {
                        let cart = user.cart;
                        for (let i = 0; i < cart.length; i++) {
                            db.get().collection(collections.PRODUCT_COLLECTIONS).updateOne({
                                _id: cart[i].proId
                            }, {
                                $inc: {
                                    stock: -(cart[i].qty)
                                }
                            }
                            )
                        }
                        db.get().collection(collections.USER_COLLECTIONS).updateOne({ mobile: mob }, {
                            $unset: {
                                cart: ''
                            }
                        })
                        
                        // console.log(user.cart);

                        resolve(true)

                    })
                }
            }

        })
    },
    addPayOrder: (discount, total, mob, addr) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collections.USER_COLLECTIONS).findOne({ mobile: mob })
            // console.log(user);

            if (!user.address) {
                reject(true)
            } else {
                if (user.address.length == 0) {
                    reject(true)
                } else {
                    db.get().collection(collections.ORDER_COLLECTION).insertOne({
                        userMobile: mob,
                        products: user.cart,
                        address: user.address[addr],
                        payMethod: 'Razorpay',
                        discount: Number(discount),
                        total: Number(total),
                        createdOn: new Date(),
                        status: 'payment pending'
                    }).then((response) => {
                        resolve(response.insertedId)
                    })
                }
            }


        })
    },
    generateRazorPay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            instance.orders.create({
                amount: total * 100,
                currency: "INR",
                receipt: orderId.toString(),
                notes: {
                    key1: "value3",
                    key2: "value2"
                }
            }, function (err, order) {
                // console.log("new order: ", order);
                // console.log(err);
                resolve(order)
            })
        })
    },
    getAllOrders: (mob) => {
        return new Promise(async (resolve, reject) => {

            let orders = await db.get().collection(collections.ORDER_COLLECTION).
                aggregate([{ $match: { userMobile: mob } },
                {
                    $project: {
                        _id: 1,
                        userMobile: 1,
                        products: 1,
                        product: { $arrayElemAt: ["$products", 0] },
                        createdOn: 1,
                        status: 1,
                        payMethod: 1
                    }
                },
                { $lookup: { from: collections.PRODUCT_COLLECTIONS, localField: "product.proId", foreignField: "_id", as: "items" } },
                { $sort: { createdOn: -1 } }]).toArray()

            // console.log(orders);
            // let orders =await db.get().collection(collections.ORDER_COLLECTION).find({userMobile:mob})
            // .sort({createdOn:-1}).toArray()
            resolve(orders)
        })
    },
    getOneOrder: (id) => {
        return new Promise(async (resolve, reject) => {
            let orderArr = await db.get().collection(collections.ORDER_COLLECTION).
                aggregate([{ $match: { _id: ObjectId(id) } },
                { $unwind: '$products' },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTIONS,
                        localField: "products.proId",
                        foreignField: "_id", as: "items"
                    }
                }]).toArray()
            resolve(orderArr)
        })
    },
    cancelOrder: (id) => {
        return new Promise(async(resolve, reject) => {
            let order = await db.get().collection(collections.ORDER_COLLECTION).findOne({_id: ObjectId(id)})
            let cart = order.products;
                        for (let i = 0; i < cart.length; i++) {
                            db.get().collection(collections.PRODUCT_COLLECTIONS).updateOne({
                                _id: cart[i].proId
                            }, {
                                $inc: {
                                    stock: cart[i].qty
                                }
                            }
                            )
                        }
            db.get().collection(collections.ORDER_COLLECTION).updateOne(
                { _id: ObjectId(id) },
                { $set: { status: 'Cancelled', closedOn: new Date() } }
            )
            db.get().collection(collections.USER_COLLECTIONS).updateOne({mobile:order.userMobile},{
                $inc:{
                    wallet: order.total
                }
            })
            resolve(order.total)
        })
    },
    deliverOrder: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION).updateOne(
                { _id: ObjectId(id) },
                { $set: { status: 'Delivered', closedOn: new Date() } }
            )
            resolve(true)
        })
    },
    verifyPayment: (body) => {
        return new Promise((resolve, reject) => {
            const check = validatePaymentVerification({
                "order_id": body['payment[razorpay_order_id]'],
                "payment_id": body['payment[razorpay_payment_id]']
            },
                body['payment[razorpay_signature]'], process.env.RAZ_KEY_SECRET);
            console.log(check);
            if (check) {
                resolve()
            } else {
                reject()
            }

        })
    },
    changePayStatus: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: ObjectId(id) },
                { $set: { status: 'processing' } }
            )
            let order = await db.get().collection(collections.ORDER_COLLECTION).findOne({ _id: ObjectId(id) })
            let cart = order.products
            for (let i = 0; i < cart.length; i++) {
                db.get().collection(collections.PRODUCT_COLLECTIONS).updateOne({
                    _id: cart[i].proId
                }, {
                    $inc: {
                        stock: -(cart[i].qty)
                    }
                }
                )
            }
            db.get().collection(collections.USER_COLLECTIONS).updateOne({ mobile: order.userMobile }, {
                $unset: {
                    cart: ''
                }
            })
            reportHelpers.removePendings()
            
            
            resolve()
        })
    },
    addBanners: (image, description) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.BANNER_COLLECTION).insertOne({
                image: image.filename,
                description: description
            })
            resolve(true)
        })

    },
    getAllBanners: () => {
        return new Promise(async (resolve, reject) => {
            let banners = await db.get().collection(collections.BANNER_COLLECTION).find().toArray()
            resolve(banners)
        })
    },
    selectBanner: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.BANNER_COLLECTION).updateOne({ status: true },
                { $set: { status: false } }
            )
            await db.get().collection(collections.BANNER_COLLECTION).updateOne({ _id: ObjectId(id) },
                { $set: { status: true } }
            )
            resolve(true)
        })
    },
    returnOrder: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION).updateOne(
                { _id: ObjectId(id) },
                { $set: { status: 'Return processing', closedOn: new Date() } }
            )
            
            resolve(true)
        })
    },
    returnedOrder: (id) => {
        return new Promise(async(resolve, reject) => {
            let order = await db.get().collection(collections.ORDER_COLLECTION).findOne({_id: ObjectId(id)})
            let cart = order.products;
                        for (let i = 0; i < cart.length; i++) {
                            db.get().collection(collections.PRODUCT_COLLECTIONS).updateOne({
                                _id: cart[i].proId
                            }, {
                                $inc: {
                                    stock: cart[i].qty
                                }
                            }
                            )
                        }
            db.get().collection(collections.ORDER_COLLECTION).updateOne(
                { _id: ObjectId(id) },
                { $set: { status: 'Returned', closedOn: new Date() } }
            )
            db.get().collection(collections.USER_COLLECTIONS).updateOne({mobile:order.userMobile},{
                $inc:{
                    wallet: order.total
                }
            })
            resolve(order.total)
        })
    },
    getOrderDate: (date1) => {
        return new Promise(async (resolve, reject) => {
            console.log(date1);
            const isTdate = new Date(date1).toISOString();
            console.log(isTdate);
            const date = new Date(isTdate);
            date.setUTCDate(date.getUTCDate() + 1);
            date.setUTCHours(0, 0, 0, 0);
            const newDate = date.toISOString();

            console.log(isTdate);
            console.log(newDate);
            let orderArr = await db.get().collection(collections.ORDER_COLLECTION).find({
                createdOn: {
                    $gte: new Date(isTdate),
                    $lt: new Date(newDate)
                }
            }).toArray()
            // console.log(orderArr);
            resolve(orderArr)
        })
    }
}

