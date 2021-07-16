/*
 Options to pass to helmet
 See https://helmetjs.github.io/
 for all options available
*/
module.exports = {
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'script-src': [
        "'self'",
        'www.googletagmanager.com',
        'dap.digitalgov.gov',
        'www.google-analytics.com',
        (_, res) => `'nonce-${res.locals.cspNonce}'`,
      ],
      'connect-src': [
        "'self'",
        'www.google-analytics.com',
      ],
      'frame-ancestors': [
        "'none'",
      ],
      'form-action': [
        "'self'",
      ],
    },
  },
  frameguard: {
    action: 'deny',
  },
  xssFilter: false,
};
