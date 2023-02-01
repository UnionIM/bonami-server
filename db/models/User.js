import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: String,
  socialMedia: {
    telegram: String,
    instagram: String,
    facebook: String,
    viber: String,
  },
  firstName: String,
  secondName: String,
  createdAt: Date,
  updatedAt: Date,
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model('User', UserSchema);

export default User;
