import GoogleStrategy from 'passport-google-oauth20';
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
