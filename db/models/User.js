import mongoose from 'mongoose';
import findOrCreate from 'mongoose-findorcreate';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
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

UserSchema.plugin(findOrCreate);

const User = mongoose.model('User', UserSchema);

export default User;
