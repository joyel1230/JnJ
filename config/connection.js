const mongoClient = require('mongodb').MongoClient
require('dotenv').config()
const state = {
    db: null
}

module.exports.connect = function (done) {
    const url = process.env.MONGO_URL
    const dbname = process.env.DB_NAME

    mongoClient.connect(url, (err, data) => {
        if (err) return done(err)
        state.db = data.db(dbname)
        done()
    })
}

module.exports.get = function () {
    return state.db
}
