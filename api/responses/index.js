const badRequest = require('./badRequest');
const error = require('./error');
const forbidden = require('./forbidden');
const notFound = require('./notFound');
const ok = require('./ok');
const serverError = require('./serverError');

module.exports = (req, res, next) => {
  res.badRequest = data => badRequest(data, { res });
  res.error = data => error(data, { res });
  res.forbidden = data => forbidden(data, { res });
  res.notFound = data => notFound(data, { res });
  res.ok = data => ok(data, { res });
  res.serverError = data => serverError(data, { res });
  next();
};
