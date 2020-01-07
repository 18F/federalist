const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../app');
const factory = require('../support/factory');
const { authenticatedSession } = require('../support/session');
const validateAgainstJSONSchema = require('../support/validateAgainstJSONSchema');
const { BuildLog } = require('../../../api/models');

describe.only('Build Log API', () => {
  describe('POST /v0/build/:build_id/log/:token', () => {
    const encode64 = str => Buffer.from(str, 'utf8').toString('base64');

    it('should create a build log with the given params', (done) => {
      let build;

      factory.build().then((model) => {
        build = model;

        return request(app)
          .post(`/v0/build/${build.id}/log/${build.token}`)
          .type('json')
          .send({ source: 'build.sh', output: encode64('This is the output for build.sh') })
          .expect(200);
      }).then((response) => {
        validateAgainstJSONSchema('POST', '/build/{build_id}/log/{token}', 200, response.body);

        expect(response.body).to.have.property('source', 'build.sh');
        expect(response.body).to.have.property('output', 'This is the output for build.sh');

        return BuildLog.findAll({ where: { build: build.id } });
      }).then((logs) => {
        expect(logs).to.have.length(1);
        expect(logs[0]).to.have.property('source', 'build.sh');
        expect(logs[0]).to.have.property('output', 'This is the output for build.sh');
        done();
      })
        .catch(done);
    });

    it('should respond with a 400 if the params are not correct', (done) => {
      factory.build().then(build => request(app)
        .post(`/v0/build/${build.id}/log/${build.token}`)
        .type('json')
        .send({ src: 'build.sh', otpt: encode64('This is the output for build.sh') })
        .expect(400)).then((response) => {
        validateAgainstJSONSchema('POST', '/build/{build_id}/log/{token}', 400, response.body);
        done();
      }).catch(done);
    });

    it('should respond with a 404 and not create a build log for an invalid build token', (done) => {
      let build;

      factory.build().then((model) => {
        build = model;

        return request(app)
          .post(`/v0/build/${build.id}/log/invalid-token`)
          .type('json')
          .send({ source: 'build.sh', output: encode64('This is the output for build.sh') })
          .expect(404);
      }).then((response) => {
        validateAgainstJSONSchema('POST', '/build/{build_id}/log/{token}', 404, response.body);

        return BuildLog.findAll({ where: { build: build.id } });
      }).then((logs) => {
        expect(logs).to.be.empty;
        done();
      })
        .catch(done);
    });

    it('should respond with a 404 if no build is found for the given id', (done) => {
      const buildLogRequest = request(app)
        .post('/v0/build/fake-id/log/fake-build-token')
        .type('json')
        .send({ source: 'build.sh', output: encode64('This is the output for build.sh') })
        .expect(404);

      buildLogRequest.then((response) => {
        validateAgainstJSONSchema('POST', '/build/{build_id}/log/{token}', 404, response.body);
        done();
      }).catch(done);
    });

    it('should respond with a 404 if build id is a number and not found', (done) => {
      factory.build().then(build => request(app)
        .post(`/v0/build/-100/log/${build.token}`)
        .type('json')
        .send({ src: 'build.sh', otpt: encode64('This is the output for build.sh') })
        .expect(404)).then((response) => {
        validateAgainstJSONSchema('POST', '/build/{build_id}/log/{token}', 404, response.body);
        done();
      }).catch(done);
    });
  });

  describe('GET /v0/build/:build_id/log', () => {
    it('should require authentication', (done) => {
      factory.buildLog().then(buildLog => request(app)
        .get(`/v0/build/${buildLog.build}/log`)
        .expect(403)).then((response) => {
        validateAgainstJSONSchema('GET', '/build/{build_id}/log', 403, response.body);
        done();
      }).catch(done);
    });

    describe('successfully fetching build logs', () => {
      const prepareAndFetchLogData = () => {
        const userPromise = factory.user();
        const sitePromise = factory.site({ users: Promise.all([userPromise]) });
        const buildPromise = factory.build({ user: userPromise, site: sitePromise });

        return Promise.props({ user: userPromise, site: sitePromise, build: buildPromise })
          .then(({ build, user }) => Promise.all([
            Promise.all(Array(3).fill(0).map(() => factory.buildLog({ build }))),
            authenticatedSession(user),
          ])).then(([logs, cookie]) => {
            const buildId = logs[0].get({ plain: true }).build;

            return request(app)
              .get(`/v0/build/${buildId}/log`)
              .set('Cookie', cookie)
              .expect(200);
          });
      };

      const expectedResponse = (response, done) => {
        validateAgainstJSONSchema('GET', '/build/{build_id}/log', 200, response.body);
        expect(response.body).to.be.an('array');
        expect(response.body).to.have.length(3);
        done();
      };

      it('should render builds logs for the given build', (done) => {
        prepareAndFetchLogData()
          .then(response => expectedResponse(response, done))
          .catch(done);
      });

      it('should render logs if user is not associated to the build', (done) => {
        prepareAndFetchLogData()
          .then(response => expectedResponse(response, done))
          .catch(done);
      });
    });

    describe('successfully fetching build logs with pagination', () => {
      const fetchLogData = ({ logLen, page }, status = 200) => {
        const userPromise = factory.user();
        const sitePromise = factory.site({ users: Promise.all([userPromise]) });
        const buildPromise = factory.build({ user: userPromise, site: sitePromise });

        return Promise.props({ user: userPromise, build: buildPromise })
          .then(({ user, build }) => Promise.props({
            logs: Promise.all(Array(logLen).fill(0).map(() => factory.buildLog({ build }))),
            cookie: authenticatedSession(user),
            page,
          })).then(({ logs, cookie }) => {
            const buildId = logs[0].get({ plain: true }).build;
            return request(app)
              .get(`/v0/build/${buildId}/log/page/${page}`)
              .set('Cookie', cookie)
              .expect(status);
          });
      };

      const expectedResponse = (logsOnPage, response, done) => {
        validateAgainstJSONSchema('GET', '/build/{build_id}/log', 200, response.body);
        expect(response.body).to.be.an('array');
        expect(response.body).to.have.length(logsOnPage);
        done();
      };

      it('should render builds logs for the given build on page 1', (done) => {
        fetchLogData({ logLen: 6, page: 1 })
          .then(response => expectedResponse(5, response, done))
          .catch(done);
      });

      it('should render builds logs for the given build on page 2', (done) => {
        fetchLogData({ logLen: 8, page: 2 })
          .then(response => expectedResponse(3, response, done))
          .catch(done);
      });

      it('should render builds logs for the given build on empty page 3', (done) => {
        fetchLogData({ logLen: 10, page: 3 })
          .then(response => expectedResponse(0, response, done))
          .catch(done);
      });

      it('should respond with a 404 if page is 0', (done) => {
        fetchLogData({ logLen: 10, page: 0 }, 404)
          .then((response) => {
            validateAgainstJSONSchema('GET', '/build/{build_id}/log', 404, response.body);
            done();
          });
      });
    });

    it("should respond with a 404 if the given build is not associated with one of the user's sites", (done) => {
      let build;

      factory.build().then((model) => {
        build = model;

        return Promise.all(Array(3).fill(0).map(() => factory.buildLog()));
      })
        .then(() => factory.user()).then(user => authenticatedSession(user))
        .then(cookie => request(app)
          .get(`/v0/build/${build.id}/log`)
          .set('Cookie', cookie)
          .expect(404))
        .then((response) => {
          validateAgainstJSONSchema('GET', '/build/{build_id}/log', 404, response.body);
          done();
        })
        .catch(done);
    });

    it('should response with a 404 if the given build does not exist', (done) => {
      authenticatedSession().then(cookie => request(app)
        .get('/v0/build/fake-id/log')
        .set('Cookie', cookie)
        .expect(404)).then((response) => {
        validateAgainstJSONSchema('GET', '/build/{build_id}/log', 404, response.body);
        done();
      }).catch(done);
    });

    it('should response with a 404 if the given build does not exist', (done) => {
      authenticatedSession().then(cookie => request(app)
        .get('/v0/build/-100/log')
        .set('Cookie', cookie)
        .expect(404)).then((response) => {
        validateAgainstJSONSchema('GET', '/build/{build_id}/log', 404, response.body);
        done();
      }).catch(done);
    });
  });
});
