import mongoose from 'mongoose';

export const Item = new mongoose.Schema({
  name: { en: String, ua: String },
  description: { en: String, ua: String },
  price: Number,
  discount: Number,
  images: [{ url: String }],
  category: { en: String, ua: String },
});
