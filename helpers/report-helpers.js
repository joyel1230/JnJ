const db = require('../config/connection');
const collections = require('../config/collections');
const ObjectId = require('mongodb').ObjectId;


module.exports = {
    getTotalSales:()=>{
        return new Promise(async(resolve, reject) => {
            let totalArr = await db.get().collection(collections.ORDER_COLLECTION).find().toArray()
            const sum = totalArr.reduce(
                (sum,element)=>{
                    return sum + element.total
                },
                0
            )
            resolve(sum)
        })
    }
}