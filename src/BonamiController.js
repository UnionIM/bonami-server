import User from '../db/models/User.js';
import BonamiService from './BonamiService.js';
import Item from '../db/models/Item.js';

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
      let { page, per_page, search } = req.query;
      if (!page) {
        page = 1;
      }
      if (!per_page) {
        per_page = 12;
      }
      const limit = parseInt(per_page);
      const skip = (page - 1) * per_page;

      const itemList = await BonamiService.getItemList(search, limit, skip);
      Item.count(
        { 'name.ua': { $regex: '^' + search } },
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
}

export default new BonamiController();
