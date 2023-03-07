import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { en: String, ua: String },
});

const Category = mongoose.model('Category', CategorySchema);

export default Category;
