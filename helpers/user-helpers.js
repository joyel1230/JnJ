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
    doLogin: (mob,pass) => {
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
    getAllUsers:()=>{
        return new Promise(async(resolve, reject) => {
            let users=db.get().collection(collections.USER_COLLECTIONS).find().toArray()
            resolve(users)
        })
    },
    deleteUser:(proId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTIONS).deleteOne({_id:ObjectId(proId)}).then(()=>{
                resolve(true)
            })
        })
    },
    getUserDetails:(proId)=>{
        return new Promise((resolve, reject) => {
             db.get().collection(collections.USER_COLLECTIONS).findOne({_id:ObjectId(proId)}).then((product)=>{
                 resolve(product)
             })
         })
     },
     updateUser:(proId,userDetails)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTIONS).updateOne({_id:ObjectId(proId)},
            {$set:{name:userDetails.name,
                mobile:userDetails.mobile,
                email:userDetails.email,
                address:userDetails.address,}
            }).then(()=>{
                resolve()
            })
        })
    },
    getUsers:(user)=>{
        return new Promise(async (resolve, reject) => {
        console.log(user);
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


           console.log(users);
           resolve(users)
        })
    },
    getProducts:(user)=>{
        return new Promise(async (resolve, reject) => {
        console.log(user);
        //    let users= await db.get().collection(collections.USER_COLLECTIONS).find({$or:[{$text:{$search: user}},{$match:{name:'0'}}]}).toArray()
        
        let regex = new RegExp(user, "i");
        let users = await db.get().collection(collections.PRODUCT_COLLECTIONS).find({
          $or: [
            { name: { $regex: regex } },
            { category: { $regex: regex } }
          ]
        }).toArray();
        

        //    let users= await db.get().collection(collections.PRODUCT_COLLECTIONS).find({name: /^user/}).toArray()
           console.log(users);
           resolve(users)
        })
    },
    active:(mob)=>{
        return new Promise(async (resolve, reject) => {
           await db.get().collection(collections.USER_COLLECTIONS).updateOne({mobile:mob},{$set:{active:true}})
           resolve(true)
        })
    },
    inActive:(mob)=>{
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.USER_COLLECTIONS).updateOne({mobile:mob},{$set:{active:false}})
            resolve(true)
         })
    },
    blockUser:(mob)=>{
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.USER_COLLECTIONS).updateOne({mobile:mob},{$set:{blocked:true}})
            resolve(true)
        })
    },
    unblockUser:(mob)=>{
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.USER_COLLECTIONS).updateOne({mobile:mob},{$set:{blocked:false}})
            resolve(true)
        })
    }
}