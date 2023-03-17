import User from '../db/models/User.js';
import BonamiService from './BonamiService.js';
import Item from '../db/models/Item.js';
import Order from '../db/models/Order.js';
import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.FROM_EMAIL,
    pass: process.env.FROM_PASSWORD,
  },
});

const createMailOptions = (name, delivery) => {
  return {
    from: process.env.FROM_EMAIL,
    to: process.env.TO_EMAIL,
    subject: 'New order was created',
    text: 'That was easy!',
    html:
      '<!DOCTYPE html> <html> <head> <link rel="preconnect" href="https://fonts.googleapis.com"> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet"> <style> body{font-family: Roboto} .style{color: blue} </style> </head> <body style="background-color:powderblue;">' +
      '<h1>' +
      name.firstName +
      ' ' +
      name.secondName +
      '</h1>' +
      '<p>' +
      delivery.country +
      ', ' +
      delivery.city +
      ',  ' +
      delivery.region +
      ', ' +
      delivery.street +
      ', ' +
      delivery.address +
      '</p>' +
      '</body> </html>',
  };
};

class BonamiController {
  async SignUpUser(req, res) {
    try {
      const { email, password, phone, socialMedia, firstName, secondName } =
        req.body;
      if (!email || !password) {
        res.status(400);
        return res.json({
          error: 'Enter a user name and password',
        });
      }
      if (await User.findOne({ email: email }).exec()) {
        res.status(400);
        return res.json({
          error: 'User with this email is already exist',
        });
      }
      if (!phone && !socialMedia) {
        res.status(400);
        return res.json({
          error: 'Enter a phone number or at least 1 social media id or tag',
        });
      }
      const user = await BonamiService.SignUpUser(
        email,
        password,
        phone,
        socialMedia,
        firstName,
        secondName
      );
      res.json(user);
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400);
        return res.json({
          error: 'Enter a email or password',
        });
      }
      const user = await BonamiService.login(email, password);
      res.json(user);
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async isAuth(req, res) {
    try {
      if (req.user) {
        res.status(200).json({ isAuth: true });
      } else {
        res.status(401).json({ isAuth: false });
      }
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async getUserData(req, res) {
    try {
      const user = await BonamiService.getUserData(req.user.email);
      res.json(user);
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async updateUserData(req, res) {
    try {
      const _id = req.user._id;
      if (!_id) {
        res.status(400);
        return res.json({
          error: 'Enter a id',
        });
      }
      const { email, password, phone, socialMedia, firstName, secondName } =
        req.body;
      if (!phone && !socialMedia) {
        res.status(400);
        return res.json({
          error: 'Enter a phone number or at least 1 social media id or tag',
        });
      }
      const user = await BonamiService.updateUserData(
        _id,
        email,
        password,
        phone,
        socialMedia,
        firstName,
        secondName
      );
      res.json(user);
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async createItem(req, res) {
    try {
      const {
        nameEn,
        nameUa,
        descriptionEn,
        descriptionUa,
        price,
        discount,
        categoryEn,
        categoryUa,
      } = req.body;
      const files = req.files;
      const item = await BonamiService.createItem(
        nameEn,
        nameUa,
        descriptionEn,
        descriptionUa,
        price,
        discount,
        categoryEn,
        categoryUa,
        files
      );
      res.json(item);
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async getItemList(req, res) {
    try {
      let { page, per_page, search, category } = req.query;
      if (!page) {
        page = 1;
      }
      if (!per_page) {
        per_page = 12;
      }
      const limit = parseInt(per_page);
      const skip = (page - 1) * per_page;

      const itemList = await BonamiService.getItemList(
        search,
        category,
        limit,
        skip
      );
      Item.count(
        {
          'name.ua': { $regex: '^' + search },
          'category.en': { $regex: '^' + category },
        },
        function (err, count) {
          if (err) {
            console.log(err);
          } else {
            res.json({ itemList: itemList, totalCount: count });
          }
        }
      );
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async getCategories(req, res) {
    try {
      const categories = await BonamiService.getCategories();
      res.json(categories);
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async createCategory(req, res) {
    try {
      const { name } = req.body;
      const category = await BonamiService.createCategory(name.en, name.ua);
      res.json(category);
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async deleteCategoriesWithoutItems(req, res) {
    try {
      const category = await BonamiService.deleteCategoriesWithoutItems();
      res.json(category);
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async deleteItem(req, res) {
    try {
      const { id } = req.body;
      await BonamiService.deleteItem(id);
      res.status(200).json({ message: 'success' });
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async createOrder(req, res) {
    try {
      const {
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
      } = req.body;
      if (!items.length) {
        res.status(400);
        return res.json({
          error: 'Add more items to order',
        });
      }
      if (!phoneNumber && !socialMedia) {
        res.status(400);
        return res.json({
          error: 'Enter a phone number or at least 1 social media id or tag',
        });
      }
      if (!delivery && !deliveryToPostOffice) {
        res.status(400);
        return res.json({
          error: 'Enter a delivery information',
        });
      }
      const isAuthenticated = !!(await User.findOne({ email: email }).exec());
      const createdAt = Date.now();
      const order = await BonamiService.createOrder(
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
      );
      const mailOptions = createMailOptions(order.name, order.delivery);
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      res.status(200).json(order);
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async getOrderList(req, res) {
    try {
      let { email, date_start, date_end, page, per_page } = req.query;
      if (!page) {
        page = 1;
      }
      if (!per_page) {
        per_page = 12;
      }
      if (!date_start) {
        date_start = 0;
      }
      if (!date_end) {
        date_end = '9999-01-01T00:00:00.001Z';
      }

      const limit = parseInt(per_page);
      const skip = (page - 1) * per_page;

      const orderList = await BonamiService.getOrderList(
        email,
        date_start,
        date_end,
        limit,
        skip
      );
      Order.count(
        {
          email: { $regex: '^' + email },
          createdAt: {
            $gte: date_start,
            $lte: date_end,
          },
        },
        function (err, count) {
          if (err) {
            console.log(err);
          } else {
            res.json({ orderList: orderList, totalCount: count });
          }
        }
      );
    } catch (e) {
      res.status(500).json(e.message);
    }
  }
}

export default new BonamiController();
