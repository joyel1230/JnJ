const db = require("../config/connection");
const collections = require("../config/collections");
const ObjectId = require("mongodb").ObjectId;
const slugify = require("slugify");
module.exports = {
  addProduct: async (product, images, callback) => {
    let imagesFiles = images.map((file) => file.filename);

    async function slugged(string) {
      const randomNumber = Math.floor(Math.random() * 9000) + 1000;
      let sluged = await slugify(`${string} ${randomNumber}`, {
        replacement: "-",
        lower: true,
      });
      let data = await db
        .get()
        .collection(collections.PRODUCT_COLLECTIONS)
        .findOne({ slug: sluged });
      if (data) {
        slugged(string);
      } else {
        return sluged;
      }
    }
    let slugName = await slugged(product.name);

    db.get()
      .collection(collections.PRODUCT_COLLECTIONS)
      .insertOne({
        name: product.name,
        categoryId: ObjectId(product.category),
        price: Number(product.price),
        description: product.description,
        stock: Number(product.stock),
        images: imagesFiles,
        slug: slugName,
      })
      .then((data) => {
        // console.log(data);
        callback(data.insertedId);
      });
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collections.BANNER_COLLECTION)
        .updateOne({ status: false }, { $set: { status: "true" } });
      await db
        .get()
        .collection(collections.BANNER_COLLECTION)
        .updateOne({ status: true }, { $set: { status: false } });
      await db
        .get()
        .collection(collections.BANNER_COLLECTION)
        .updateOne({ status: "true" }, { $set: { status: true } });
      let category = await db
        .get()
        .collection(collections.CATEGORY_COLLECTION)
        .find()
        .toArray();
      let products = await db
        .get()
        .collection(collections.PRODUCT_COLLECTIONS)
        .aggregate([
          {
            $lookup: {
              from: collections.CATEGORY_COLLECTION,
              localField: "categoryId",
              foreignField: "_id",
              as: "categoryAs",
            },
          },
        ])
        .toArray();
      let banner = await db
        .get()
        .collection(collections.BANNER_COLLECTION)
        .findOne({ status: true });

      let array = [category, products, banner];
      resolve(array);
    });
  },
  deleteProduct: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCT_COLLECTIONS)
        .updateOne({ _id: ObjectId(proId) }, { $set: { deleted: true } })
        .then(() => {
          resolve(true);
        });
    });
  },
  getProductDetails: (proId) => {
    return new Promise(async (resolve, reject) => {
      let category = await db
        .get()
        .collection(collections.CATEGORY_COLLECTION)
        .find()
        .toArray();
      let product = await db
        .get()
        .collection(collections.PRODUCT_COLLECTIONS)
        .aggregate([
          { $match: { _id: ObjectId(proId) } },
          {
            $lookup: {
              from: collections.CATEGORY_COLLECTION,
              localField: "categoryId",
              foreignField: "_id",
              as: "categoryAs",
            },
          },
        ])
        .toArray();
      // .then((product) => {
      // console.log(product);
      let array = [category, product[0]];
      resolve(array);
      // })
    });
  },
  updateProduct: (proId, proDetails, image) => {
    return new Promise((resolve, reject) => {
      if (!image) {
        db.get()
          .collection(collections.PRODUCT_COLLECTIONS)
          .updateOne(
            { _id: ObjectId(proId) },
            {
              $set: {
                name: proDetails.name,
                categoryId: ObjectId(proDetails.category),
                price: Number(proDetails.price),
                description: proDetails.description,
                stock: Number(proDetails.stock),
              },
            }
          )
          .then(() => {
            resolve();
          });
      } else {
        db.get()
          .collection(collections.PRODUCT_COLLECTIONS)
          .updateOne(
            { _id: ObjectId(proId) },
            {
              $set: {
                name: proDetails.name,
                category: proDetails.category,
                price: Number(proDetails.price),
                description: proDetails.description,
                stock: Number(proDetails.stock),
                "images.0": image.filename,
              },
            }
          )
          .then(() => {
            resolve();
          });
      }
    });
  },
  addCategory: (cat) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CATEGORY_COLLECTION)
        .insertOne({ category: cat })
        .then(() => {
          resolve(true);
        });
    });
  },
  getCategory: () => {
    return new Promise(async (resolve, reject) => {
      let cat = await db
        .get()
        .collection(collections.CATEGORY_COLLECTION)
        .find()
        .toArray();
      resolve(cat);
    });
  },
  editCategory: (first, newOne) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CATEGORY_COLLECTION)
        .updateOne({ category: first }, { $set: { category: newOne } });
      resolve(true);
    });
  },
  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      let orderArr = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .find()
        .sort({ createdOn: -1 })
        .toArray();
      // console.log(orderArr);
      resolve(orderArr);
    });
  },
  getOneOrderId: (id) => {
    return new Promise(async (resolve, reject) => {
      let orderArr = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .aggregate([
          { $match: { _id: ObjectId(id) } },
          { $unwind: "$products" },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTIONS,
              localField: "products.proId",
              foreignField: "_id",
              as: "items",
            },
          },
        ])
        .toArray();
      resolve(orderArr);
    });
  },
  getHerProducts: () => {
    return new Promise(async (resolve, reject) => {
      let herProducts = await db
        .get()
        .collection(collections.PRODUCT_COLLECTIONS)
        .aggregate([
          {
            $lookup: {
              from: collections.CATEGORY_COLLECTION,
              localField: "categoryId",
              foreignField: "_id",
              as: "categoryAs",
            },
          },
          {
            $unwind: "$categoryAs",
          },
          {
            $match: {
              "categoryAs.category": /^girl/i,
            },
          },
        ])
        .toArray();
      herProducts.map((product) => {
        product.price = product.price.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
          currencyDisplay: "symbol",
          minimumFractionDigits: 2,
        });
      });
      // console.log(herProducts);
      resolve(herProducts);
    });
  },
  getHimProducts: () => {
    return new Promise(async (resolve, reject) => {
      let himProducts = await db
        .get()
        .collection(collections.PRODUCT_COLLECTIONS)
        .aggregate([
          {
            $lookup: {
              from: collections.CATEGORY_COLLECTION,
              localField: "categoryId",
              foreignField: "_id",
              as: "categoryAs",
            },
          },
          {
            $unwind: "$categoryAs",
          },
          {
            $match: {
              "categoryAs.category": /^boy/i,
            },
          },
        ])
        .toArray();
      // console.log(herProducts);
      himProducts.map((product) => {
        product.price = product.price.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
          currencyDisplay: "symbol",
          minimumFractionDigits: 2,
        });
      });
      resolve(himProducts);
    });
  },
  getLtoHProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.PRODUCT_COLLECTIONS)
        .aggregate([
          {
            $sort: { price: 1 },
          },
        ])
        .toArray();
      products.map((product) => {
        product.price = product.price.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
          currencyDisplay: "symbol",
          minimumFractionDigits: 2,
        });
      });
      console.log(products);
      resolve(products);
    });
  },
  getHtoLProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.PRODUCT_COLLECTIONS)
        .aggregate([
          {
            $sort: { price: -1 },
          },
        ])
        .toArray();
      products.map((product) => {
        product.price = product.price.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
          currencyDisplay: "symbol",
          minimumFractionDigits: 2,
        });
      });
      console.log(products);
      resolve(products);
    });
  },
};
