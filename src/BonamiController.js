import User from '../db/models/User.js';
import BonamiService from './BonamiService.js';
import Item from '../db/models/Item.js';
import Order from '../db/models/Order.js';
import { transporter, createMailOptions } from './nodemailer.js';

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
      if (await User.findOne({ email: email.toLowerCase() }).exec()) {
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
        email.toLowerCase(),
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
      const user = await BonamiService.login(email.toLowerCase(), password);
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
      //const user = await BonamiService.getUserData(req.user.email);
      res.json(req.user);
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
      if (!search) {
        search = '';
      }
      if (!category) {
        category = '';
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
            res.status(502).json(err);
          } else {
            res.status(200).json({ itemList: itemList, totalCount: count });
          }
        }
      );
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async getItemById(req, res) {
    try {
      const { id } = req.query;
      const item = await BonamiService.getItemById(id);
      if (item) {
        res.status(200).json(item);
      } else {
        res.status(404).json({ message: 'Item was not found' });
      }
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
      const { id } = req.query;
      await BonamiService.deleteItem(id);
      res.status(200).json({ message: 'success' });
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async updateItem(req, res) {
    try {
      const {
        id,
        nameEn,
        nameUa,
        descriptionEn,
        descriptionUa,
        price,
        discount,
        categoryEn,
        categoryUa,
      } = req.body;
      const updateData = await BonamiService.updateItem(
        id,
        nameEn,
        nameUa,
        descriptionEn,
        descriptionUa,
        price,
        discount,
        categoryEn,
        categoryUa
      );
      res.status(200).json(updateData);
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
        postOfficeInformation,
        name,
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
      if (!delivery && !postOfficeInformation) {
        res.status(400);
        return res.json({
          error: 'Enter a delivery information',
        });
      }
      const totalPrice = items.reduce(
        (acc, val) => acc + val.price * val.amount,
        0
      );
      const status = 'pending';
      const isAuthenticated = !!(await User.findOne({
        email: email.toLowerCase(),
      }).exec());
      const createdAt = Date.now();
      const order = await BonamiService.createOrder(
        items,
        email.toLowerCase(),
        phoneNumber,
        socialMedia,
        delivery,
        postOfficeInformation,
        name,
        status,
        notes,
        isPaid,
        isAuthenticated,
        createdAt,
        totalPrice
      );
      const mailOptions = createMailOptions(
        order.name,
        order.delivery,
        order.createdAt,
        order.socialMedia,
        order.email,
        order.phoneNumber
      );
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
      let {
        email,
        date_start,
        date_end,
        page,
        per_page,
        sort_element,
        sort_direct,
      } = req.query;
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
        date_end = Date.now();
      }
      if (!sort_element) {
        sort_element = 'status';
      }
      if (!sort_direct) {
        sort_direct = -1;
      }

      const limit = parseInt(per_page);
      const skip = (page - 1) * per_page;

      const orderList = await BonamiService.getOrderList(
        email.toLowerCase(),
        date_start,
        date_end,
        sort_element,
        sort_direct,
        limit,
        skip
      );
      Order.count(
        {
          email: { $regex: '^' + email.toLowerCase() },
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

  async getOrderById(req, res) {
    try {
      const { id } = req.query;
      const order = await BonamiService.getOrderById(id);
      res.status(200).json(order);
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { id } = req.query;
      const { status } = req.body;
      if (
        status !== 'pending' &&
        status !== 'canceled' &&
        status !== 'delivered'
      ) {
        res.status(400).json({
          message:
            'Wrong delivery status, only: pending, canceled or delivered',
        });
      }
      const updateData = await BonamiService.updateOrderStatus(id, status);
      res.status(200).json(updateData);
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async getHomePageData(req, res) {
    try {
      const rawHomePageData = await BonamiService.getHomePageData();
      res.status(200).json(rawHomePageData);
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async recalculateOrderStatistic(req, res) {
    try {
      const recalculatedData = await BonamiService.recalculateOrderStatistic();
      res.status(200).json(recalculatedData);
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async getOrderGraphData(req, res) {
    try {
      const graphData = await BonamiService.getOrderGraphData();
      res.status(200).json(graphData);
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async createReview(req, res) {
    try {
      let { id, rating, author, text, ordered } = req.body;
      if (rating > 5) {
        rating = 5;
      }
      if (rating < 0) {
        rating = 0;
      }
      if (text.length > 250) {
        text = text.slice(0, 250);
      }
      const createdReview = await BonamiService.createReview(
        id,
        rating,
        author,
        text,
        ordered
      );
      res.status(200).json(createdReview);
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async deleteReview(req, res) {
    try {
      const { item, review } = req.query;
      const data = await BonamiService.deleteReview(item, review);
      if (data.modifiedCount >= 1) {
        res.status(200).json({ message: 'Review was deleted' });
      } else {
        res.status(401).json({ message: 'Review was not deleted' });
      }
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async deleteItemImages(req, res) {
    try {
      const { id, indexes } = req.body;
      const success = await BonamiService.deleteItemImages(id, indexes);
      if (success) {
        res.status(200).json({ message: 'Success' });
      } else {
        res
          .status(400)
          .json({ message: 'Wrong data, server error, try again later' });
      }
    } catch (e) {
      res.status(500).json(e.message);
    }
  }

  async updateItemImages(req, res) {
    try {
      const { id, indexes } = req.body;
      const files = req.files;
      const indexesArr = [];
      if (!Array.isArray(indexes)) {
        indexesArr.push(indexes);
      } else {
        for (const index of indexes) {
          indexesArr.push(index);
        }
      }
      await BonamiService.updateItemImages(id, indexesArr, files);
      res.status(200).json({ message: 'success' });
    } catch (e) {
      res.status(500).json(e.message);
    }
  }
}

export default new BonamiController();
