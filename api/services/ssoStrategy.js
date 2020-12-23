const { Strategy } = require('passport-oauth2');

function createSSOStrategy(options, verify) {
  const {
    logoutCallbackURL, logoutURL, userURL, ...rest
  } = options;

  const opts = { ...rest, scope: ['read_write'] };

  const strategy = new Strategy(opts, verify);

  strategy.userProfile = (accessToken, callback) => {
    // eslint-disable-next-line no-underscore-dangle
    strategy._oauth2.get(userURL, accessToken, (err, body) => {
      if (err) {
        console.log(err)
        return callback(err);
      }

      try {
        return callback(null, JSON.parse(body));
      } catch (e) {
        return callback(e);
      }
    });
  };

  const params = new URLSearchParams();
  params.set('redirect', logoutCallbackURL);
  params.set('client_id', opts.clientID);

  strategy.logoutRedirectURL = `${logoutURL}?${params.toString()}`;

  return strategy;
}

module.exports = { createSSOStrategy };
