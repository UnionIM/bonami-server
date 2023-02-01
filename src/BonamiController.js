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

  async getUserData(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400);
        return res.json({
          error: 'Enter a email',
        });
      }
      const user = await BonamiService.getUserData(email);
      res.json(user);
    } catch (e) {
      res.status(500).json(e.message);
    }
  }
}

export default new BonamiController();
