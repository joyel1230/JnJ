const db = require('../config/connection');
const collections = require('../config/collections');
const ObjectId = require('mongodb').ObjectId;
const couponHelpers = require('../helpers/coupon-helpers')


module.exports = {
    getTotalSales: () => {
        return new Promise(async (resolve, reject) => {
            let objR = {};
            let saleArray = []
            let category = []
            let categorySale = []
            let sixDate = []
            let date = new Date()
            let dateOnly = new Date().toISOString().slice(0, 10)
            let date2digit = new Date().toISOString().slice(8, 10)

            let yesterday = new Date(date.getTime() - (24 * 60 * 60 * 1000));
            let yesterday1 = new Date(yesterday.getTime() - (24 * 60 * 60 * 1000));
            let yesterday2 = new Date(yesterday1.getTime() - (24 * 60 * 60 * 1000));
            let yesterday3 = new Date(yesterday2.getTime() - (24 * 60 * 60 * 1000));
            let yesterday4 = new Date(yesterday3.getTime() - (24 * 60 * 60 * 1000));
            

            let yes = yesterday.toISOString().slice(8, 10)
            let yes1 = yesterday1.toISOString().slice(8, 10)
            let yes2 = yesterday2.toISOString().slice(8, 10)
            let yes3 = yesterday3.toISOString().slice(8, 10)
            let yes4 = yesterday4.toISOString().slice(8, 10)
            sixDate.push(Number(yes4))
            sixDate.push(Number(yes3))
            sixDate.push(Number(yes2))
            sixDate.push(Number(yes1))
            sixDate.push(Number(yes))
            sixDate.push(Number(date2digit))
            objR.sixDates =sixDate







            let dateOnlyYest = yesterday.toISOString().slice(0, 10);

            date = date.getDate()
            objR.todaySale = await findSaleSum(date)
            let yesterSale = await findSaleSum(date - 1)
            let yesterSale1 = await findSaleSum(date - 2)
            let yesterSale2 = await findSaleSum(date - 3)
            let yesterSale3 = await findSaleSum(date - 4)
            let yesterSale4 = await findSaleSum(date - 5)
            saleArray.push(objR.todaySale)
            saleArray.push(yesterSale)
            saleArray.push(yesterSale1)
            saleArray.push(yesterSale2)
            saleArray.push(yesterSale3)
            saleArray.push(yesterSale4)

            objR.saleArr = saleArray;
            objR.today = +date2digit;

            objR.percDiff = (((objR.todaySale - yesterSale) / yesterSale) * 100).toFixed(2)
            objR.margin = Math.floor((objR.todaySale / 100) * 25);
            objR.todayOrder = await findOrederNum(date)
            objR.yesterOrder = await findOrederNum(date - 1)
            // console.log(objR.todayOrder);
            // console.log(objR.yesterOrder);
            objR.percDiffOrder = (((objR.todayOrder - objR.yesterOrder) / objR.yesterOrder) * 100).toFixed(2)

            objR.todaySearch = await findSearchNum(dateOnly)
            objR.yesterSearch = await findSearchNum(dateOnlyYest)
            objR.percDiffSearch = (((objR.todaySearch - objR.yesterSearch) / objR.yesterSearch) * 100).toFixed(2)

            let catSale = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            { $lookup: { from: "product", localField: "products.proId", foreignField: "_id", as: "productInfo" } }, 
            { $unwind: "$productInfo" }, 
            { $lookup: { from: "category", localField: "productInfo.categoryId", foreignField: "_id", as: "categoryInfo" } }, 
            { $unwind: "$categoryInfo" }, 
            { $group: { _id: "$categoryInfo.category", total: { $sum: 
            { $multiply: [{ $cond: { if: { $isArray: "$products.qty" }, then: { $arrayElemAt: ["$products.qty", 0] }, else: "$products.qty" } }, "$productInfo.price"] } } } }]).toArray()
            for (let i = 0; i < catSale.length; i++) {
                category.push(catSale[i]._id)
                categorySale.push(catSale[i].total)
            }
            objR.category = category
            objR.categorySale = categorySale
            let payM = await findPayNum()
            // console.log(payM);
            objR.cod = Math.floor(payM.cod * 100);
            objR.raz = Math.floor(payM.raz * 100);
            objR.pay = Math.floor(payM.pay * 100);

            // console.log(objR.todaySale);

            couponHelpers.getProductsQty(date2digit).then((arr) => {
                objR.productSum = arr[0]
                objR.qtySum = arr[1]
                resolve(objR)
            })
        })




        async function findSaleSum(date) {
            let totalArr = await db.get().collection(collections.ORDER_COLLECTION).find({
                $expr: {
                    $eq: [{ $dayOfMonth: "$createdOn" }, date]
                },
                status: {
                    $nin: ["Cancelled", "Returned"]
                }
            }).toArray()

            const sum = await totalArr.reduce(
                (sum, element) => {
                    return sum + element.total
                },
                0
            )
            return sum;
        }
        async function findOrederNum(date) {
            let totalArr = await db.get().collection(collections.ORDER_COLLECTION).find({
                $expr: {
                    $eq: [{ $dayOfMonth: "$createdOn" }, date]
                }
            }).toArray()
            let num = totalArr.length
            return num;
        }
        async function findSearchNum(date) {
            let doc = await db.get().collection(collections.SEARCH_COLLECTION).findOne({ date: date })
            let num = doc?.search ?? 1

            return num;
        }
        async function findPayNum() {
            let objP = {};
            cod = await db.get().collection(collections.ORDER_COLLECTION).find({ payMethod: 'COD' }).toArray()
            raz = await db.get().collection(collections.ORDER_COLLECTION).find({ payMethod: 'Razorpay' }).toArray()
            pay = await db.get().collection(collections.ORDER_COLLECTION).find({ payMethod: 'Paypal' }).toArray()
            let sum = cod.length + raz.length + pay.length;
            objP.cod = (cod.length) / sum;
            objP.raz = (raz.length) / sum;
            objP.pay = (pay.length) / sum;
            return objP;
        }
    },
    searches: async () => {

        let today = new Date().toISOString().slice(0, 10)
        let searchDay = await db.get().collection(collections.SEARCH_COLLECTION).findOne({ date: today })
        if (searchDay) {
            db.get().collection(collections.SEARCH_COLLECTION).updateOne({ date: today }, { $inc: { search: 1 } })
        } else {
            db.get().collection(collections.SEARCH_COLLECTION).insertOne({
                date: today,
                search: 1
            })
        }
    },
    removePendings: () => {
        db.get().collection(collections.ORDER_COLLECTION).deleteMany({ status: "payment pending" })
    }
}