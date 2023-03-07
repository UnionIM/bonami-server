import GoogleStrategy from 'passport-google-oauth20';
import passport from 'passport';
import User from '../db/models/User.js';
import PassportLocal from 'passport-local';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
dotenv.config();

passport.use(
  'local',
  new PassportLocal.Strategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email });
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

passport.use(
  'google',
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/google/callback',
    },
    function (accessToken, refreshToken, profile, done) {
      User.findOrCreate(
        { email: profile._json.email },
        { createdAt: Date.now(), updatedAt: Date.now() },
        (err, user) => done(err, user)
      );
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser((id, done) => {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
