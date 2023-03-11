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
    }
}