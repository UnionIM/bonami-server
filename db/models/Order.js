import mongoose from 'mongoose';

export const OrderSchema = new mongoose.Schema({
  items: [
    {
      id: String,
      name: { en: String, ua: String },
      picture: String,
      price: Number,
      amount: Number,
    },
  ],
  email: String,
  phoneNumber: String,
  socialMedia: {
    telegram: String,
    instagram: String,
    facebook: String,
    viber: String,
  },
  delivery: {
    country: String,
    city: String,
    region: String,
    street: String,
    address: String,
    postIndex: String,
  },
  postOfficeInformation: {
    deliveryCompanyName: String,
    postOfficeNumber: String,
  },
  name: {
    firstName: String,
    secondName: String,
    patronymic: String,
  },
  status: String,
  notes: String,
  isPaid: Boolean,
  isAuthenticated: Boolean,
  createdAt: Number,
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;
