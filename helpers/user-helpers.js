const db = require('../config/connection');
const collections = require('../config/collections');
const bcrypt = require('bcrypt')
const ObjectId = require('mongodb').ObjectId;


module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10);
            let user = await db.get().collection(collections.USER_COLLECTIONS).findOne({ mobile: userData.mobile })
            if (user) {
                await db.get().collection(collections.USER_COLLECTIONS).updateOne({ mobile: user.mobile }, { $set: { password: userData.password } })
                resolve(user)
            } else {
                let data = await db.get().collection(collections.USER_COLLECTIONS).insertOne(userData)
                resolve(data)
            }
        })
    },
    doLogin: (mob, pass) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collections.USER_COLLECTIONS).findOne({ mobile: mob })
            if (user) {
                bcrypt.compare(pass, user.password).then((status) => {
                    if (status) {
                        console.log('login success');
                        response.user = user
                        response.status = true
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
    getUsers: (user) => {
        return new Promise(async (resolve, reject) => {
            // console.log(user);
            //    let users= await db.get().collection(collections.USER_COLLECTIONS).find({$text:{$search: user}}).toArray()
            //    let users= await db.get().collection(collections.USER_COLLECTIONS).find({name:{$regex:`^${user}`}}).toArray()

            let regex = new RegExp(user, "i");
            let users = await db.get().collection(collections.USER_COLLECTIONS).find({
                $or: [
                    { name: { $regex: regex } },
                    { email: { $regex: regex } },
                    { address: { $regex: regex } },
                    { mobile: { $regex: regex } }
                ]
            }).toArray();


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
            wish = wish.wishlist
            resolve(wish[0])

            // db.get().collection(collections.USER_COLLECTIONS).updateOne({mobile:userMob},{$unset:{wishlist:""}})
            // db.get().collection(collections.USER_COLLECTIONS).updateOne({mobile:userMob},{$set:{cart:wish}})
        })
    },
    getAllCart: (userMob) => {
        return new Promise(async (resolve, reject) => {
            let cartArr = await db.get().collection(collections.USER_COLLECTIONS).aggregate([{ $match: { mobile: userMob } }, { $unwind: "$cart" }, { $lookup: { from: "product", localField: "cart.proId", foreignField: "_id", as: "cartItems" } }]).toArray()
            // console.log(cartArr);
            resolve(cartArr)
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
            let product = await db.get().collection(collections.PRODUCT_COLLECTIONS).findOne({ _id: ObjectId(proId) })
            let category = await db.get().collection(collections.CATEGORY_COLLECTION).findOne({ _id: ObjectId(product.categoryId) })
            let stock = Number(product.stock)
            let arr = [product, category, stock]
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
    getAddCheckout: (mob, qty) => {
        
        let qtyArr=[]
        qtyArr.push(...qty.split(','))
        qty=qtyArr;
        // console.log(qty);
        return new Promise(async (resolve, reject) => {
            let add = await db.get().collection(collections.USER_COLLECTIONS).findOne({ mobile: mob })
            
            for (let i = 0; i < qty.length; i++) {
                updateQty(mob, qty[i], i)
            }
            function updateQty(mob, qty, i) {
                qty = Number(qty)
                db.get().collection(collections.USER_COLLECTIONS).updateOne(
                    { mobile: mob },
                    { $set: { [`cart.${i}.qty`]: qty } })
            }
            let cartArr = await db.get().collection(collections.USER_COLLECTIONS).aggregate
                ([{ $match: { mobile: mob } }, { $unwind: "$cart" },
                { $lookup: { from: collections.PRODUCT_COLLECTIONS, localField: "cart.proId", foreignField: "_id", as: "cartItems" } }]).toArray()
                if(add.address){
                add = add.address.slice(-1)[0]
                }
            let array = [add, cartArr]
            db.get().collection(collections.USER_COLLECTIONS).updateOne({mobile:mob},{$set:{
                discount:Number(0)
            }})
            resolve(array)
        })
    },
    checkCoupon:(code,total,mob)=>{
        return new Promise(async(resolve, reject) => {
            let coupon = await db.get().collection(collections.COUPON_COLLECTION).findOne({code:code})
            if (coupon) {
                if (total>=coupon.minPur) {
                    await db.get().collection(collections.USER_COLLECTIONS).updateOne(
                        {mobile:mob},{$set:{
                            discount:Number(coupon.amount)
                        }}
                    )
                    resolve(true)
                }else{
                    resolve(false)
                }
            } else {
                resolve(false)
            }
            resolve(false)
        })
    },
    addCashOrder:(discount,total,mob)=>{
        return new Promise(async(resolve, reject) => {
            let user =await db.get().collection(collections.USER_COLLECTIONS).findOne({mobile:mob})
            db.get().collection(collections.ORDER_COLLECTION).insertOne({
                userMobile: mob,
                products: user.cart,
                address: user.address[user.address.length-1],
                payMethod:'cash on delivery',
                discount:Number(discount),
                total:Number(total),
                createdOn:new Date(),
                status:'processing'
            })
            resolve(true)
        })
    },
    getAllOrders:(mob)=>{
        return new Promise(async(resolve, reject) => {

            let orders = await db.get().collection(collections.ORDER_COLLECTION).
            aggregate([{ $match: { userMobile: mob } },
                {
                    $project: {
                      _id: 1,
                      userMobile: 1,
                      products: 1,
                      product: { $arrayElemAt: ["$products", 0] },
                      createdOn: 1,
                      status: 1
                    }
                  }, 
            { $lookup: { from: collections.PRODUCT_COLLECTIONS, localField: "product.proId", foreignField: "_id", as: "items" } },
            {$sort:{createdOn:-1}}]).toArray()

            // console.log(orders);
            // let orders =await db.get().collection(collections.ORDER_COLLECTION).find({userMobile:mob})
            // .sort({createdOn:-1}).toArray()
            resolve(orders)
        })
    },
    getOneOrder:(id)=>{
        return new Promise(async(resolve, reject) => {
            let orderArr = await db.get().collection(collections.ORDER_COLLECTION).
            aggregate([{ $match: { _id: ObjectId(id) } },
            {$unwind:'$products'}, 
            { $lookup: {
                 from: collections.PRODUCT_COLLECTIONS, 
                 localField: "products.proId",
                 foreignField: "_id", as: "items" 
                } }]).toArray()
            resolve(orderArr)
        })
    },
    cancelOrder:(id)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION).updateOne(
                {_id:ObjectId(id)},
                {$set:{status:'Cancelled',closedOn:new Date()}}
                )
                resolve(true)
        })
    },
    deliverOrder:(id)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION).updateOne(
                {_id:ObjectId(id)},
                {$set:{status:'Delivered',closedOn:new Date()}}
                )
                resolve(true)
        })
    }
}

