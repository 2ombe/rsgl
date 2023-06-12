import express from "express";

const seedRouter = express.Router();
import data from "../data.js";
import Product from "../models/productModel.js";
import User from "../models/userModal.js";

seedRouter.get("/", async (req, res) => {
  await Product.remove({});
  const createdProducts = await Product.insertMany(data.products);

  await User.remove({});
  const createUser = await User.insertMany(data.users);
  res.send({ createdProducts, createUser });
});

export default seedRouter;
