const { ObjectId } = require("mongodb");
const db = require("../config/connection");
const collections = require("../config/collections");
const reportHelpers = require("../helpers/report-helpers");
const oneUSD = 73.098;

const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.PAY_KEY_ID,
  client_secret: process.env.PAY_KEY_SECRET,
});
module.exports = {
  payWithPaypal: async (id, res, total) => {
    total = (total / oneUSD).toFixed(2);
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `http://jnjshop.live/orders?paid=true&id=${id}`,
        cancel_url: "http://jnjshop.live/cart",
      },
      transactions: [
        {
          amount: {
            currency: "USD",
            total: `${total}`,
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
  addPaypalOrder: (discount, total, mob, addr, wallet) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collections.USER_COLLECTIONS)
        .findOne({ mobile: mob });
      if (!user.address) {
        reject(true);
      } else {
        if (user.address.length == 0) {
          reject(true);
        } else {
          if (wallet === "true") {
            db.get()
              .collection(collections.USER_COLLECTIONS)
              .updateOne({ mobile: mob }, { $set: { walletUsed: true } });
          }
          db.get()
            .collection(collections.ORDER_COLLECTION)
            .insertOne({
              userMobile: mob,
              products: user.cart,
              address: user.address[addr],
              payMethod: "Paypal",
              discount: Number(discount),
              total: Number(total),
              createdOn: new Date(),
              status: "payment pending",
            })
            .then((response) => {
              resolve(response.insertedId);
            });
        }
      }
    });
  },
  paidPaypalOrder: (paid, id) => {
    return new Promise(async (resolve, reject) => {
      if (paid == "true") {
        let order = await db
          .get()
          .collection(collections.ORDER_COLLECTION)
          .findOne({ _id: ObjectId(id) });
        let cart = order.products;
        for (let i = 0; i < cart.length; i++) {
          db.get()
            .collection(collections.PRODUCT_COLLECTIONS)
            .updateOne(
              {
                _id: cart[i].proId,
              },
              {
                $inc: {
                  stock: -cart[i].qty,
                },
              }
            );
        }
        let user = db
          .get()
          .collection(collections.USER_COLLECTIONS)
          .findOne({ mobile: order.userMobile });
        let wall = user.wallet - Math.floor(user.wallet / 4);
        if (user.walletUsed) {
          db.get()
            .collection(collections.USER_COLLECTIONS)
            .updateOne(
              { mobile: order.userMobile },
              { $set: { wallet: wall, walletUsed: false } }
            );
          db.get()
            .collection(collections.ORDER_COLLECTION)
            .updateOne(
              { _id: ObjectId(id) },
              { $set: { wallet: Math.floor(user.wallet / 4) } }
            );
        }

        db.get()
          .collection(collections.USER_COLLECTIONS)
          .updateOne(
            { mobile: order.userMobile },
            {
              $unset: {
                cart: "",
              },
            }
          );
        db.get()
          .collection(collections.ORDER_COLLECTION)
          .updateOne(
            { _id: ObjectId(id) },
            {
              $set: {
                status: "processing",
              },
            }
          )
          .then((response) => {
            resolve(true);
          });
      } else {
        reportHelpers.removePendings();
      }

      resolve(true);
    });
  },
};
