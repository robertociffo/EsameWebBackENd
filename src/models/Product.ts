import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  price: { type: Number, required: true },
  rank: { type: String, required: true},
  reviews: { type: String, required: true},
});

export const Product = mongoose.model("Product", ProductSchema);
