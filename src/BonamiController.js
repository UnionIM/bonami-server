import User from '../db/models/User.js';
import BonamiService from './BonamiService.js';

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

  async getCatalog(req, res) {
    try {
      const catalog = await BonamiService.getCatalog();
      res.json(catalog);
    } catch (e) {
      res.status(500).json(e.message);
    }
  }
}

export default new BonamiController();
