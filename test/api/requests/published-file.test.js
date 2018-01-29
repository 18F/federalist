const AWSMocks = require('../support/aws-mocks');
const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../../app');
const config = require('../../../config');
const factory = require('../support/factory');
const { authenticatedSession } = require('../support/session');
const validateAgainstJSONSchema = require('../support/validateAgainstJSONSchema');

describe('Published Files API', () => {
  describe('GET /v0/site/:site_id/published-branch/:branch/file', () => {
    it('should require authentication', (done) => {
      factory.site().then(site => request(app)
          .get(`/v0/site/${site.id}/published-branch/${site.defaultBranch}`)
          .expect(403)).then((response) => {
            validateAgainstJSONSchema('GET', '/site/{site_id}/published-branch/{branch}/published-file', 403, response.body);
            done();
          }).catch(done);
    });

    it('should list the files published to the branch for the site', (done) => {
      let site;
      let prefix;
      const userPromise = factory.user();
      const sitePromise = factory.site({
        defaultBranch: 'master',
        users: Promise.all([userPromise]),
      });
      const cookiePromise = authenticatedSession(userPromise);

      AWSMocks.mocks.S3.listObjectsV2 = (params, callback) => {
        expect(params.Bucket).to.equal(config.s3.bucket);
        expect(params.Prefix).to.equal(prefix);

        callback(null, {
          IsTruncated: false,
          Contents: [
            { Key: `${prefix}abc`, Size: 123 },
            { Key: `${prefix}abc/def`, Size: 456 },
            { Key: `${prefix}ghi`, Size: 789 },
          ],
        });
      };

      Promise.props({
        user: userPromise,
        site: sitePromise,
        cookie: cookiePromise,
      }).then((promisedValues) => {
        site = promisedValues.site;
        prefix = `site/${site.owner}/${site.repository}/`;

        return request(app)
          .get(`/v0/site/${site.id}/published-branch/master/published-file`)
          .set('Cookie', promisedValues.cookie)
          .expect(200);
      }).then((response) => {
        validateAgainstJSONSchema('GET', '/site/{site_id}/published-branch/{branch}/published-file', 200, response.body);

        const files = response.body.files;
        files.forEach((file) => {
          delete file.publishedBranch; // eslint-disable-line no-param-reassign
        });
        expect(files).to.deep.equal([
          { name: 'abc', size: 123, key: `${prefix}abc` },
          { name: 'abc/def', size: 456, key: `${prefix}abc/def` },
          { name: 'ghi', size: 789, key: `${prefix}ghi` },
        ]);
        done();
      }).catch(done);
    });

    it('should 403 if the user is not associated with the site', (done) => {
      const user = factory.user();
      const site = factory.site({ defaultBranch: 'master' });
      const cookie = authenticatedSession(user);

      Promise.props({ user, site, cookie }).then(promisedValues => request(app)
          .get(`/v0/site/${promisedValues.site.id}/published-branch/master/published-file`)
          .set('Cookie', promisedValues.cookie)
          .expect(403)).then((response) => {
            validateAgainstJSONSchema('GET', '/site/{site_id}/published-branch/{branch}/published-file', 403, response.body);
            done();
          }).catch(done);
    });
  });
});
