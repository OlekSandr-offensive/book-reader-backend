const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const dotenv = require('dotenv');
dotenv.config();

const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const { userService: services } = require('../services');
const { RequestError } = require('../helpers');

const { SECRET_KEY } = process.env;

const auth0Settings = {
  domain: process.env.AUTH0_DOMAIN,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  callbackURL: process.env.AUTH0_CALLBACK_URL,
};

passport.use(
  'auth0',
  new Auth0Strategy(
    auth0Settings,
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id: auth0Id, displayName, emails } = profile;
        const email = emails?.[0]?.value;

        if (!email) {
          return done(RequestError(400, 'Email not found in Auth0 profile'));
        }

        let user = await User.findOne({ auth0Id });

        if (!user) {
          user = await new User({
            name: displayName,
            email,
            auth0Id,
          }).save();
        }

        const tokenPayload = { id: user._id };
        const token = jwt.sign(tokenPayload, SECRET_KEY, {
          expiresIn: '1d',
        });

        await services.updateToken(user._id, token);
        user.token = token;

        return done(null, user);
      } catch (error) {
        done(RequestError(500, `Auth0 strategy error: ${error.message}`));
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(RequestError(500, 'Failed to deserialize user'));
  }
});

module.exports = passport;
