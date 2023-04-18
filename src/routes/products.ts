import express from "express";
import { body, header, param, query } from "express-validator";
import { checkErrors } from "./utils";
import { isAuth } from "./auth";
const router = express.Router();
import { Product } from "../models/Product";

router.post(
  "/",
  header("authorization").isJWT(),
  body("category").exists().isString(),
  body("subcategory").exists().isString(),
  body("price").exists().isNumeric(),
  body("rank").exists().isString(),
  body("reviews").exists().isString(),
  checkErrors,
  isAuth,
  async (req, res) => {
    const { category, subcategory, price, rank, reviews} = req.body;
    const product = new Product({ category, subcategory, price, rank, reviews });
    const productSaved = await product.save();
    res.status(201).json(productSaved);
  }
);
router.get(
  "/",
  query("category").optional().isString(),
  query("subcategory").optional().isString(),
  query("price").optional().isNumeric(),
  query("rank").optional().isString(),
  checkErrors,
  async (req, res) => {
    const products = await Product.find({ ...req.query });
    res.json(products);
  }
);

router.get("/:id",
 param("id").isMongoId(), 
 checkErrors, async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "product not found" });
  }
  res.json(product);
});

router.get("/category/:category",
 param("category").isString(), 
 checkErrors, async (req, res) => {
  const { category } = req.params;
  const product = await Product.find({category});
  if (!product) {
    return res.status(404).json({ message: "product not found" });
  }
  res.json(product);
});


router.delete(
  "/:id",
  header("authorization").isJWT(),
  param("id").isMongoId(),
  checkErrors,
  isAuth,
  async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }
    await Product.findByIdAndDelete(id);
    res.json({ message: "product deleted" });
  }
);






export default router;
