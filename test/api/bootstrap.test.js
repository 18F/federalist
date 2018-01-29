Promise.props = require('promise-props');

require('./support/aws-mocks');
const cleanDatabase = require('../../api/utils/cleanDatabase');
const { ActionType } = require('../../api/models');

before((done) => {
  cleanDatabase()
    .then(() => ActionType.createDefaultActionTypes())
    .then(() => done())
    .catch(err => done(err));
});
