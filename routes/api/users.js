const express = require('express');

const ctrl = require('../../controllers/users');

const { ctrlWrapper } = require('../../helpers');

const { validationBody, authenticate } = require('../../middlewares');

const { schemas } = require('../../models/user');

const passport = require('passport');

const router = express.Router();

// signup
router.post(
  '/signup',
  validationBody(schemas.registerSchema),
  ctrlWrapper(ctrl.register),
);

// signin
router.post(
  '/login',
  validationBody(schemas.loginSchema),
  ctrlWrapper(ctrl.login),
);

router.get('/logout', authenticate, ctrlWrapper(ctrl.logout));

router.get('/current', authenticate, ctrlWrapper(ctrl.current));

// GOOGLE

router.get(
  '/google',
  passport.authenticate('auth0', {
    scope: 'openid profile email',
  }),
);

router.get('/callback', passport.authenticate('auth0'), (req, res) => {
  res.redirect('http://localhost:3000/book-reader-frontend/library');
});

module.exports = router;
