import mongoose from 'mongoose';

export const Order = new mongoose.Schema({
  itemId: String,
  amount: Number,
  userId: String,
  createdAt: Date,
});
