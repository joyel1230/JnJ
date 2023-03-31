const db = require('../config/connection');
const collections = require('../config/collections');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
    addCoupons:(body)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.COUPON_COLLECTION).insertOne({
                code: body.name,
                amount: Number(body.amount),
                minPur: Number(body.minPur),
                expiry: new Date(body.date)
            })
            resolve(true)
        })
        
    },
    getAllCoupon:()=>{
        return new Promise(async(resolve, reject) => {
            let coupon = await db.get().collection(collections.COUPON_COLLECTION).find().toArray()
            
            resolve(coupon)
        })
    },
    getProductsQty:(date)=>{
        return new Promise(async(resolve, reject) => {
            date = +date;
            let totalQty = 0 ;
            let sumProduct = [] ;
            let orderArr =await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {$match:{
                $expr:{
                    $eq: [{ $dayOfMonth: "$createdOn" }, date]
                }
            }}
            ]).toArray()
            for (let i = 0; i < orderArr.length; i++) {
                
                for (let j = 0; j < (orderArr[i].products).length; j++) {
                    sumProduct.push(orderArr[i].products[j].proId.toString().slice(0, 24))
                    totalQty += orderArr[i].products[j].qty
                }
            }
            const uniqueArr = [...new Set(sumProduct)];
            let totalProduct = uniqueArr.length
            resolve([totalProduct,totalQty])
        })
        
    },
    getSearch:(search)=>{
        return new Promise(async(resolve, reject) => {
            let regex = new RegExp(search, "i");
            let product = await db.get().collection(collections.PRODUCT_COLLECTIONS).find({
                $or: [
                    { name: { $regex: regex } }
                ]
            }).toArray();
            resolve(product)
        })
    },
    postReview:(body)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.RATING_COLLECTION).updateOne({
                user:body.user,
                proId:body.proId
            },
            {$set:{
                user:body.user,
                proId:body.proId,
                rating:Number(body.ratingCount),
                name:body.name,
                review:body.message
            }},
            {
                upsert:true
            }
            )
            resolve(true)
        })
        
    }
}