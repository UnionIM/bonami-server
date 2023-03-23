import bcrypt from 'bcrypt';
import User from '../db/models/User.js';
import passport from 'passport';
import Item from '../db/models/Item.js';
import mongoose from 'mongoose';
import { s3Uploadv2 } from './s3service.js';
import Category from '../db/models/Category.js';
import Order from '../db/models/Order.js';

class BonamiService {
  async SignUpUser(email, password, phone, socialMedia, firstName, secondName) {
    const encPassword = await bcrypt.hash(password, 6);
    return await User.create({
      email: email,
      password: encPassword,
      phone: phone || '',
      socialMedia: socialMedia || '',
      firstName: firstName,
      secondName: secondName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
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
    return await User.findOne({ email: _id }).exec();
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
    const categoryCheck = await Category.findOne({
      'name.en': categoryEn,
    }).exec();
    if (!categoryCheck) {
      return 'This category does not exist';
    }
    const results = await s3Uploadv2(files, id);
    const imgArray = results.map((el) => {
      return { url: el.Location };
    });
    return await Item.create({
      _id: id,
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
  }

  async getItemList(search, category, limit, skip) {
    return Item.find(
      {
        'name.ua': { $regex: '^' + search },
        'category.en': { $regex: '^' + category },
      },
      { description: 0 },
      { limit, skip }
    );
  }

  async getCategories() {
    return Category.find();
  }

  async createCategory(nameEn, nameUa) {
    return await Category.create({
      name: {
        en: nameEn,
        ua: nameUa,
      },
    });
  }

  async deleteCategoriesWithoutItems() {
    const categories = await Category.find();
    const items = await Item.find();
    const missingCategories = [];
    const missingCategoriesId = [];
    for (let category of categories) {
      if (!items.find((el) => el.category.en === category.name.en)) {
        missingCategories.push(category);
        missingCategoriesId.push(category._id);
      }
    }
    Category.deleteMany({ _id: { $in: missingCategoriesId } }, (err) => {
      if (err) {
        console.log(err);
      }
    });
    return missingCategories;
  }

  async deleteItem(id) {
    await Item.deleteOne({ _id: id });
  }

  async createOrder(
    items,
    email,
    phoneNumber,
    socialMedia,
    delivery,
    deliveryToPostOffice,
    name,
    status,
    notes,
    isPaid,
    isAuthenticated,
    createdAt
  ) {
    return Order.create({
      items: [...items],
      email: email,
      phoneNumber: phoneNumber,
      socialMedia: socialMedia || '',
      delivery: delivery || '',
      deliveryToPostOffice: deliveryToPostOffice || '',
      name: name || '',
      status: status,
      notes: notes,
      isPaid: isPaid,
      isAuthenticated: isAuthenticated,
      createdAt: createdAt,
    });
  }

  async getOrderList(email, date_start, date_end, limit, skip) {
    return Order.find(
      {
        email: { $regex: '^' + email },
        createdAt: {
          $gte: date_start,
          $lte: date_end,
        },
      },
      {
        items: 0,
        delivery: 0,
        deliveryToPostOffice: 0,
        name: 0,
        notes: 0,
        isPaid: 0,
        isAuthenticated: 0,
      },
      { limit, skip }
    );
  }

  async getOrderById(id) {
    return Order.findOne({ _id: id });
  }

  async updateOrderStatus(id, status) {
    return Order.updateOne({ _id: id }, { status: status });
  }
}

export default new BonamiService();
