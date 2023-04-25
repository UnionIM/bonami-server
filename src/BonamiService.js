import bcrypt from 'bcrypt';
import User from '../db/models/User.js';
import passport from 'passport';
import Item from '../db/models/Item.js';
import mongoose from 'mongoose';
import {
  s3Delete,
  S3DeleteManyByIndexAndRename,
  s3Uploadv2,
} from './s3service.js';
import Category from '../db/models/Category.js';
import Order from '../db/models/Order.js';
import OrderStatistic from '../db/models/OrderStatistic.js';

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
      { description: 0, reviews: 0 },
      { limit, skip }
    );
  }

  async getItemById(id) {
    let err;
    if (id) {
      return Item.findOne({ _id: id }).catch((e) => {
        err = e;
      });
    }
    return { message: err || 'Id is undefined' };
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
    await s3Delete(id);
    await Item.deleteOne({ _id: id });
  }

  async updateItem(
    id,
    nameEn,
    nameUa,
    descriptionEn,
    descriptionUa,
    price,
    discount,
    categoryEn,
    categoryUa
  ) {
    return Item.updateOne(
      { _id: id },
      {
        $set: {
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
          category: {
            en: categoryEn,
            ua: categoryUa,
          },
        },
      }
    );
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
    createdAt,
    totalPrice
  ) {
    await OrderStatistic.updateOne(
      { _id: '6427dcc8cf3b61e727b35d28' },
      { $inc: { profitOfPendingOrders: totalPrice } }
    );
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

  async getOrderList(
    email,
    date_start,
    date_end,
    sort_element,
    sort_direct,
    limit,
    skip
  ) {
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
    ).sort({
      [sort_element]: sort_direct,
    });
  }

  async getOrderById(id) {
    let err = false;
    const order = await Order.findOne({ _id: id }).catch((e) => {
      err = e;
    });
    if (!err) {
      const amountOfOrders = await Order.countDocuments({ name: order.name });
      return { ...order._doc, amountOfOrders };
    }
    return { message: err.name };
  }

  async updateOrderStatus(id, status) {
    const order = await Order.findOne(
      { _id: id },
      {
        delivery: 0,
        postOfficeInformation: 0,
        name: 0,
        notes: 0,
        isPaid: 0,
        socialMedia: 0,
        email: 0,
        isAuthenticated: 0,
        phoneNumber: 0,
        createdAt: 0,
      },
      {}
    );
    const totalPrice = order.items.reduce(
      (acc, item) => acc + item.price * item.amount,
      0
    );
    if (status === 'delivered') {
      await OrderStatistic.updateOne(
        { _id: '6427dcc8cf3b61e727b35d28' },
        {
          $inc: {
            profitOfDeliveredOrders: totalPrice,
            profitOfPendingOrders: -totalPrice,
          },
        }
      );
    } else if (status === 'pending') {
      await OrderStatistic.updateOne(
        { _id: '6427dcc8cf3b61e727b35d28' },
        {
          $inc: {
            profitOfDeliveredOrders: -totalPrice,
            profitOfPendingOrders: totalPrice,
          },
        }
      );
    } else if (status === 'canceled' && order.status === 'pending') {
      await OrderStatistic.updateOne(
        { _id: '6427dcc8cf3b61e727b35d28' },
        {
          $inc: {
            profitOfPendingOrders: -totalPrice,
          },
        }
      );
    } else if (status === 'canceled' && order.status === 'delivered') {
      await OrderStatistic.updateOne(
        { _id: '6427dcc8cf3b61e727b35d28' },
        {
          $inc: {
            profitOfDeliveredOrders: -totalPrice,
          },
        }
      );
    }
    return Order.updateOne({ _id: id }, { status: status });
  }

  async getHomePageData() {
    const orderStatistic = await OrderStatistic.findOne({
      _id: '6427dcc8cf3b61e727b35d28',
    });
    const amountOfCategories = await Category.count();
    const orders = await Order.find(
      {},
      {
        delivery: 0,
        postOfficeInformation: 0,
        items: { name: 0, picture: 0, price: 0, id: 0 },
        name: 0,
        notes: 0,
        isPaid: 0,
        socialMedia: 0,
        email: 0,
        isAuthenticated: 0,
        phoneNumber: 0,
        createdAt: 0,
        status: 0,
      }
    );
    const result = {};

    orders.forEach((order) => {
      const items = order.items;
      items.forEach((item) => {
        const category = item.category;
        if (!result[category]) {
          result[category] = {
            categoryName: category,
            orderedItems: 0,
          };
        }

        result[category].orderedItems += item.amount;
      });
    });

    const amountOfDeliveredOrders = await Order.count({ status: 'delivered' });
    const amountOfPendingOrders = await Order.count({ status: 'pending' });
    const amountOfCanceledOrders = await Order.count({ status: 'canceled' });

    return {
      orderStatistic: {
        amountOfDeliveredOrders: amountOfDeliveredOrders,
        amountOfPendingOrders: amountOfPendingOrders,
        amountOfCanceledOrders: amountOfCanceledOrders,
        profitOfDeliveredOrders: orderStatistic.profitOfDeliveredOrders,
        profitOfPendingOrders: orderStatistic.profitOfPendingOrders,
      },
      orderedCategories: Object.values(result),
      amountOfCategories: amountOfCategories,
    };
  }

  async recalculateOrderStatistic() {
    const orders = await Order.find(
      {},
      {
        delivery: 0,
        postOfficeInformation: 0,
        items: { name: 0, picture: 0, category: 0, id: 0 },
        name: 0,
        notes: 0,
        isPaid: 0,
        socialMedia: 0,
        email: 0,
        isAuthenticated: 0,
        phoneNumber: 0,
        createdAt: 0,
      }
    );

    const profit = {
      delivered: 0,
      pending: 0,
    };

    orders.forEach((order) => {
      const orderItems = order.items;

      if (order.status === 'canceled') {
        return 0;
      } else if (order.status === 'delivered') {
        const deliveredProfit = orderItems.reduce(
          (acc, item) => acc + item.price * item.amount,
          0
        );
        profit.delivered = profit.delivered + deliveredProfit;
      } else {
        const pendingProfit = orderItems.reduce(
          (acc, item) => acc + item.price * item.amount,
          0
        );
        profit.pending = profit.pending + pendingProfit;
      }
    });

    await OrderStatistic.updateOne(
      { _id: '6427dcc8cf3b61e727b35d28' },
      {
        $set: {
          profitOfDeliveredOrders: profit.delivered,
          profitOfPendingOrders: profit.pending,
        },
      }
    );

    return profit;
  }

  async getOrderGraphData() {
    const orderDates = await Order.find(
      {},
      {
        _id: 0,
        delivery: 0,
        postOfficeInformation: 0,
        items: 0,
        name: 0,
        notes: 0,
        isPaid: 0,
        socialMedia: 0,
        email: 0,
        isAuthenticated: 0,
        phoneNumber: 0,
        status: 0,
        __v: 0,
      }
    );
    const timestampsWithoutTime = [];
    orderDates.forEach((order) => {
      const date = new Date(order.createdAt);
      timestampsWithoutTime.push(
        Date.parse(
          date.getFullYear() +
            '-' +
            (date.getMonth() + 1) +
            '-' +
            date.getDate()
        )
      );
    });
    const graphData = {};
    timestampsWithoutTime.forEach((date) => {
      if (!graphData[date]) {
        graphData[date] = { date: date, amount: 0 };
      }
      graphData[date].amount++;
    });
    return Object.values(graphData);
  }

  async createReview(id, rating, author, text, ordered) {
    if (ordered === undefined) {
      const ordersFromAuthor = await Order.find(
        { name: author },
        {
          _id: 0,
          delivery: 0,
          postOfficeInformation: 0,
          name: 0,
          notes: 0,
          isPaid: 0,
          socialMedia: 0,
          email: 0,
          isAuthenticated: 0,
          phoneNumber: 0,
          status: 0,
          createdAt: 0,
          __v: 0,
        },
        {}
      );
      const orderIndex = ordersFromAuthor.findIndex((order) => {
        return order.items.find((el) => el.id.toString() === id);
      });
      let ordered = false;
      if (orderIndex >= 0) {
        ordered = true;
      }
      return Item.updateOne(
        { _id: id },
        {
          $push: {
            reviews: { rating, author, ordered, text, createdAt: Date.now() },
          },
        }
      );
    } else {
      return Item.updateOne(
        { _id: id },
        {
          $push: {
            reviews: { rating, author, ordered, text, createdAt: Date.now() },
          },
        }
      );
    }
  }

  async deleteReview(item, review) {
    return Item.updateOne(
      { _id: item },
      { $pull: { reviews: { _id: review } } }
    );
  }

  async deleteItemImages(id, indexes) {
    await S3DeleteManyByIndexAndRename(id, indexes);
    const item = await Item.findById(id);
    if (!item) {
      throw new Error('Item not found');
    }

    const urlsToDelete = indexes.map((index) => item.images[index].url);

    await Item.updateOne(
      { _id: id },
      {
        $pull: {
          images: {
            url: {
              $in: urlsToDelete,
            },
          },
        },
      }
    );

    return true;
  }
}

export default new BonamiService();
