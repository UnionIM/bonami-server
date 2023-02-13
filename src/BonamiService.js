import bcrypt from 'bcrypt';
import User from '../db/models/User.js';
import passport from 'passport';
import Item from '../db/models/Item.js';
import mongoose from 'mongoose';
import { s3Uploadv2 } from './s3service.js';

class BonamiService {
  async SignUpUser(email, password, phone, socialMedia, firstName, secondName) {
    const encPassword = await bcrypt.hash(password, 6);
    const user = await User.create({
      email: email,
      password: encPassword,
      phone: phone || '',
      socialMedia: {
        telegram: socialMedia.telegram || '',
        instagram: socialMedia.instagram || '',
        facebook: socialMedia.facebook || '',
        viber: socialMedia.viber || '',
      },
      firstName: firstName,
      secondName: secondName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return user;
  }

  async login(email, password) {
    const user = await User.findOne({ email: email }).exec();
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return 'Wrong email or password';
    }
    passport.serializeUser((user, done) => {
      done(null, user._id);
    });
    return user;
  }

  async getUserData(_id) {
    return User.findOne({ _id: _id }).exec();
  }

  async updateUserData(
    _id,
    email,
    password,
    phone,
    socialMedia,
    firstName,
    secondName
  ) {
    return User.updateOne(
      { _id },
      {
        email,
        password,
        phone,
        socialMedia,
        firstName,
        secondName,
        updatedAt: Date.now(),
      }
    );
  }

  async createItem(
    nameEn,
    nameUa,
    descriptionEn,
    descriptionUa,
    price,
    discount,
    categoryEn,
    categoryUa,
    files
  ) {
    const id = new mongoose.Types.ObjectId();
    const results = await s3Uploadv2(files, id);
    const imgArray = results.map((el) => {
      return { url: el.Location };
    });
    const item = await Item.create({
      name: {
        en: nameEn,
        ua: nameUa,
      },
      description: {
        en: descriptionEn,
        ua: descriptionUa,
      },
      price,
      discount,
      images: imgArray,
      category: {
        en: categoryEn,
        ua: categoryUa,
      },
    });
    return item;
  }
}

export default new BonamiService();
