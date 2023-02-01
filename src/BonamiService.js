import bcrypt from 'bcrypt';
import User from '../db/models/User.js';

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
  async getUserData(email) {
    return User.findOne({ email: email }).exec();
  }
}

export default new BonamiService();
