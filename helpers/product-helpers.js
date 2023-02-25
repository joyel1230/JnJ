var db = require('../config/connection');
const collections = require('../config/collections');


module.exports={
    addProduct:(product,callback)=>{
        db.get().collection(collections.PRODUCT_COLLECTIONS).insertOne(product).then((data)=>{
            console.log(data);
            callback(data.insertedId)
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve, reject) => {
            let products=await db.get().collection(collections.PRODUCT_COLLECTIONS).find().toArray()
            resolve(products)
        })
    }
}