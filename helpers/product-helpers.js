const db = require('../config/connection');
const collections = require('../config/collections');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
    addProduct: (product, callback) => {
        db.get().collection(collections.PRODUCT_COLLECTIONS).
            insertOne({
                name: product.name,
                categoryId: ObjectId(product.category),
                price: product.price,
                description: product.description,
                stock: product.stock
                
            }
            ).then((data) => {
                console.log(data);
                callback(data.insertedId)
            })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collections.CATEGORY_COLLECTION).find().toArray()
            let products = await db.get().collection(collections.PRODUCT_COLLECTIONS).aggregate([
                {
                    $lookup: {
                        from: collections.CATEGORY_COLLECTION,
                        localField: "categoryId",
                        foreignField: "_id",
                        as: "categoryAs"
                    }
                }
            ]).toArray()
            let array = [category, products]
            resolve(array)
        })
    },
    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTIONS).updateOne({ _id: ObjectId(proId) },
            {$set:{deleted:true}}).then(() => {
                resolve(true)
            })
        })
    },
    getProductDetails: (proId) => {
        return new Promise(async(resolve, reject) => {
            let category=await db.get().collection(collections.CATEGORY_COLLECTION).find().toArray()
           let product =await db.get().collection(collections.PRODUCT_COLLECTIONS).
            aggregate([{$match:{_id: ObjectId(proId)}},
                {
                    $lookup: {
                        from: collections.CATEGORY_COLLECTION,
                        localField: "categoryId",
                        foreignField: "_id",
                        as: "categoryAs"
                    }
                }
            ]).toArray()
            // .then((product) => {
                console.log(product);
                let array =[category,product[0]]
                resolve(array)
            // })
        })
    },
    updateProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTIONS).updateOne({ _id: ObjectId(proId) },
                {
                    $set: {
                        name: proDetails.name,
                        category: proDetails.category,
                        price: proDetails.price,
                        description: proDetails.description,
                        stock: proDetails.stock
                    }
                }).then(() => {
                    resolve()
                })
        })
    },
    addCategory: (cat) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORY_COLLECTION).insertOne({ category: cat }).then(() => {
                resolve(true)
            })
        })
    },
    getCategory: () => {
        return new Promise(async (resolve, reject) => {
            let cat = await db.get().collection(collections.CATEGORY_COLLECTION).find().toArray()
            resolve(cat)
        })
    },
    editCategory: (first, newOne) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORY_COLLECTION).updateOne({ category: first }, { $set: { category: newOne } })
            resolve(true)
        })
    }
}