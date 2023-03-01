const db = require('../config/connection');
const collections = require('../config/collections');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
    addProduct: (product, callback) => {
        db.get().collection(collections.PRODUCT_COLLECTIONS).insertOne(product).then((data) => {
            console.log(data);
            callback(data.insertedId)
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collections.CATEGORY_COLLECTION).find().toArray()
            let products = await db.get().collection(collections.PRODUCT_COLLECTIONS).find().toArray()
            let array=[products,category]
            resolve(array)
        })
    },
    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTIONS).deleteOne({ _id: ObjectId(proId) }).then(() => {
                resolve(true)
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve, reject) => {
             db.get().collection(collections.PRODUCT_COLLECTIONS).findOne({_id:ObjectId(proId)}).then((product)=>{
                 resolve(product)
             })
         })
     },
     updateProduct:(proId,proDetails)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTIONS).updateOne({_id:ObjectId(proId)},
            {$set:{name:proDetails.name,
                category:proDetails.category,
                price:proDetails.price,
                description:proDetails.description,
                stock:proDetails.stock}
            }).then(()=>{
                resolve()
            })
        })
    },
    addCategory:(cat)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORY_COLLECTION).insertOne({category:cat}).then(()=>{
                resolve(true)
            })
        })
    },
    getCategory:()=>{
        return new Promise(async (resolve, reject) => {
            let cat =await db.get().collection(collections.CATEGORY_COLLECTION).find().toArray()
            resolve(cat)
        })
    }
}