import passport from 'passport';
import PassportLocal from 'passport-local';
import User from '../db/models/User.js';
import bcrypt from 'bcrypt';

passport.use(
  'local',
  new PassportLocal.Strategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !(await bcrypt.compare(password, user.password))) {
          done(null, false);
        }
        done(null, user);
      } catch (e) {
        done(e);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  return done(null, user._id.toString());
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    return done(err, user);
  });
});
