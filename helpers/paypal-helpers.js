const { ObjectId } = require("mongodb");
const db = require('../config/connection');
const collections = require('../config/collections');

const paypal = require("paypal-rest-sdk");

paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id:
      process.env.PAY_KEY_ID,
    client_secret:
      process.env.PAY_KEY_SECRET,
  });
module.exports = {
    payWithPaypal:(id,res)=>{
            const create_payment_json = {
              intent: "sale",
              payer: {
                payment_method: "paypal",
              },
              redirect_urls: {
                return_url: `http://localhost:3000/orders?paid=true&id=${id}`,
                cancel_url: "http://localhost:3000/cart",
              },
              transactions: [
                {
                  item_list: {
                    items: [
                      {
                        name: "Red Sox Hat",
                        sku: "001",
                        price: "1.00",
                        currency: "USD",
                        quantity: 1,
                      },
                    ],
                  },
                  amount: {
                    currency: "USD",
                    total: "1.00",
                  },
                  description: "Hat for the best team ever",
                },
              ],
            };
          
            paypal.payment.create(create_payment_json, function (error, payment) {
              if (error) {
                throw error;
              } else {
                for (let i = 0; i < payment.links.length; i++) {
                  if (payment.links[i].rel === "approval_url") {
                    res.redirect(payment.links[i].href);
                  }
                }
              }
            });
    },
    addPaypalOrder:(discount, total, mob) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collections.USER_COLLECTIONS).findOne({ mobile: mob })
            if (!user.address) {
                reject(true)
            }else{
                if (user.address.length==0) {
                    reject(true)
                }else{
                    db.get().collection(collections.ORDER_COLLECTION).insertOne({
                        userMobile: mob,
                        products: user.cart,
                        address: user.address[user.address.length - 1],
                        payMethod: 'Paypal',
                        discount: Number(discount),
                        total: Number(total),
                        createdOn: new Date(),
                        status: 'payment pending'
                    }).then((response) => {
                        resolve(response.insertedId)
                    })
                }
            }
            
        })
    },
    paidPaypalOrder:(paid,id)=>{
        return new Promise((resolve, reject) => {
            if (paid=='true') {
                db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:ObjectId(id)},
                {$set:
                    {
                    status: 'processing'
                }
            }).then((response) => {
                    resolve(true)
                })
            }
            resolve(true)
        })
    }
}