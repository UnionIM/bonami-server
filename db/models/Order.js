import mongoose from 'mongoose';

export const OrderSchema = new mongoose.Schema({
  items: [{ id: String, name: String, price: Number, amount: Number }],
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
    street: String,
    address: String,
    deliveryCompanyName: String,
    postOfficeNumber: String,
  },
  name: {
    firstName: String,
    secondName: String,
    patronymic: String,
  },
  status: String,
  isAuthenticated: Boolean,
  createdAt: Date,
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;
