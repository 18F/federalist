const { expect } = require('chai');
const app = require('../../../app');
const request = require('supertest');
const { authenticatedSession } = require('../support/session');
const validateAgainstJSONSchema = require('../support/validateAgainstJSONSchema');
const factory = require('../support/factory');
const userActionFactory = require('../support/factory/user-action');

const version = '/v0';
const resource = 'site';
const route = 'user-action';

const notAuthenticatedError = 'You are not permitted to perform this action. Are you sure you are logged in?';
const notAuthorizedError = 'You are not authorized to perform that action';

const path = id => `${version}/${resource}/${id}/${route}`;

const makeGetRequest = (expectedCode, { id, cookie = null }) => {
  const baseRequest = request(app).get(path(id));

  if (cookie) {
    baseRequest.set('Cookie', cookie);
  }

  return baseRequest.expect(expectedCode);
};

const buildAuthenticatedSession = (user) => {
  if (user) {
    return authenticatedSession(user);
  }

  return factory.user().then(authenticatedSession);
};

describe('UserAction API', () => {
  describe('GET v0/site/:site_id/user-action', () => {
    it('requires authentication', (done) => {
      factory.site()
      .then(site => makeGetRequest(403, { id: site.id }))
      .then((response) => {
        validateAgainstJSONSchema('GET', '/site/{site_id}/user-action', 403, response.body);
        expect(response.body.message).to.equal(notAuthenticatedError);
        done();
      })
      .catch(done);
    });

    it('returns a 403 if the site is not associated with the user', (done) => {
      buildAuthenticatedSession()
      .then(cookie =>
        makeGetRequest(403, { id: 0, cookie })
      )
      .then((response) => {
        validateAgainstJSONSchema('GET', '/site/{site_id}/user-action', 403, response.body);
        expect(response.body.message).to.equal(notAuthorizedError);
        done();
      })
      .catch(done);
    });

    it('returns a list of user actions associated with a site', (done) => {
      const userActionCount = 2;
      let currentUser;
      let actions;

      factory.user()
      .then((user) => {
        currentUser = user;
        return userActionFactory.buildMany({ user }, userActionCount);
      })
      .then((userActions) => {
        actions = userActions;
        return buildAuthenticatedSession(currentUser);
      })
      .then(cookie =>
        makeGetRequest(200, { id: actions[0].siteId, cookie })
      )
      .then((response) => {
        const { body } = response;

        expect(body).to.be.defined;
        expect(body.length).to.equal(userActionCount);

        body.forEach((action) => {
          expect(action.actionTarget).to.have.all.keys('id', 'username', 'email', 'createdAt');
          expect(action.actionType).to.have.all.keys('action');
        });

        done();
      })
      .catch(done);
    });
  });
});
