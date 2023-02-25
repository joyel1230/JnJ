var db = require('../config/connection');
const collections = require('../config/collections');
const bcrypt = require('bcrypt')

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
    }
}