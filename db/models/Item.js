import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  name: { en: String, ua: String },
  description: { en: String, ua: String },
  price: Number,
  discount: Number,
  images: [{ url: String }],
  category: { en: String, ua: String },
  reviews: [
    {
      rating: Number,
      author: { firstName: String, secondName: String, patronymic: String },
      ordered: Boolean,
      text: String,
      createdAt: Number,
    },
  ],
});

const Item = mongoose.model('Item', ItemSchema);

export default Item;
