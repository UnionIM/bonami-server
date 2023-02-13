import GoogleStrategy from 'passport-google-oauth2';
import passport from 'passport';
import User from '../db/models/User.js';
import * as dotenv from 'dotenv';
dotenv.config();

passport.use(
  'google',
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/google/callback',
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      User.findOrCreate(
        { email: profile.email },
        { createdAt: Date.now(), updatedAt: Date.now() },
        (err, user) => done(err, user)
      );
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
