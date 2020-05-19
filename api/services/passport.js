const url = require('url');
const GitHubStrategy = require('passport-github').Strategy;
const passport = require('passport');
const config = require('../../config');
const { User } = require('../models');
const { logger } = require('../../winston');
const GitHub = require('./GitHub');
const RepositoryVerifier = require('./RepositoryVerifier');

const githubVerifyCallback = (accessToken, refreshToken, profile, callback) => {
  let user;
  return GitHub.validateUser(accessToken)
    .then(() => User.findOrCreate({
      where: { username: profile.username.toLowerCase() },
      defaults: {
        // eslint-disable-next-line no-underscore-dangle
        email: profile._json.email,
        username: profile.username,
      },
    }))
    .then((models) => {
      [user] = models;
      if (!user) {
        throw new Error(`Unable to find or create user ${profile.username}`);
      }
      return user.update({
        githubAccessToken: accessToken,
        githubUserId: profile.id,
        signedInAt: new Date(),
      });
    })
    .then(() => {
      RepositoryVerifier.verifyUserRepos(user); // verify user's site's repos
      callback(null, user);
    })
    .catch((err) => {
      logger.warn('Authentication error: ', err);
      callback(err);
    });
};

passport.use(new GitHubStrategy(config.passport.github.options, githubVerifyCallback));

passport.logout = (req, res) => {
  req.logout();
  req.session.destroy(() => {
    res.redirect(config.app.homepageUrl);
  });
};

passport.callback = (req, res) => {
  const { pathname } = url.parse(req.originalUrl);

  if (pathname === '/admin/auth/github/callback') {
    passport.authenticate('admin-auth')(req, res, () => {
      if (req.user) {
        req.session.adminAuthenticated = true;
        req.session.adminAuthenticatedAt = new Date();
        req.session.save(() => {
          if (req.session.authRedirectPath) {
            res.redirect(req.session.authRedirectPath);
          } else {
            res.redirect('/admin');
          }
        });
      } else {
        req.flash('error', {
          title: 'Unauthorized',
          message: 'You don\'t have access to Federalist admin!',
        });
        res.redirect('/home-admin');
      }
    });
  } else {
    passport.authenticate('github')(req, res, () => {
      if (req.user) {
        req.session.authenticated = true;
        req.session.authenticatedAt = new Date();
        req.session.save(() => {
          if (req.session.authRedirectPath) {
            res.redirect(req.session.authRedirectPath);
          } else {
            res.redirect('/');
          }
        });
      } else {
        req.flash('error', {
          title: 'Unauthorized',
          message: 'Apologies; you don\'t have access to Federalist! '
                   + 'Please contact the Federalist team if this is in error.',
        });
        res.redirect('/');
      }
    });
  }
};

passport.serializeUser((user, next) => {
  next(null, user.id);
});

passport.deserializeUser((id, next) => {
  User.findByPk(id).then((user) => {
    next(null, user);
  });
});

const externalCallback = (accessToken, _refreshToken, _profile, callback) => {
  GitHub.validateUser(accessToken)
    .then(() => callback(null, { accessToken }))
    .catch((err) => {
      if (err.message === 'Unauthorized') {
        callback(null, false);
      } else {
        callback(err);
      }
    });
};

passport.use('external', new GitHubStrategy(config.passport.github.externalOptions, externalCallback));

const adminAuthCallback = async (accessToken, _refreshToken, profile, callback) => {
  try {
    await GitHub.validateAdmin(accessToken);
    const user = await User.findOne({
      where: { username: profile.username.toLowerCase() },
      defaults: {
        // eslint-disable-next-line no-underscore-dangle
        email: profile._json.email,
        username: profile.username,
      },
    });

    if (!user) {
      throw new Error(`Unable to find admin user ${profile.username}`);
    }

    const updatedUser = await user.update({
      githubAccessToken: accessToken,
      githubUserId: profile.id,
      signedInAt: new Date(),
    });

    return callback(null, updatedUser);
  } catch (error) {
    logger.warn('Admin authentication error: ', error);
    return callback(error);
  }
};

passport.use('admin-auth', new GitHubStrategy(config.passport.github.adminOptions, adminAuthCallback));

module.exports = passport;
