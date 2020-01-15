const { expect } = require('chai');
const sinon = require('sinon');
const moment = require('moment');
const fsMock = require('mock-fs');
const proxyquire = require('proxyquire').noCallThru();

const config = require('../../../../config');

const MockWebpackConfig = {
  output: { filename: 'filename.js', publicPath: '/publicPath/' },
  plugins: [{ options: { filename: 'filename.css' } }],
};

const utils = proxyquire('../../../../api/utils', { '../../webpack.development.config.js': MockWebpackConfig });

describe('utils', () => {
  describe('.filterEntity', () => {
    const name = 'one';
    const field = 'name';
    const entity1 = { [field]: name };
    const entity2 = { [field]: 'two' };

    it('should filter out the named entity from an objects resources array', () => {
      const resources = [{ entity: entity1 }, { entity: entity2 }];

      const result = utils.filterEntity({ resources }, name, field);

      expect(result).to.deep.equal({ entity: entity1 });
    });

    it('should throw an error if entity not found', () => {
      const resources = [{ entity: entity2 }];

      const fn = () => utils.filterEntity({ resources }, name, field);

      expect(fn).to.throw(Error, `Not found: Entity @${field} = ${name}`);
    });

    describe('when name is `basic-public`', () => {
      it('returns the entity that matches the configured S3 plan', () => {
        const basicPublic = 'basic-public';
        const entity = { [field]: basicPublic, unique_id: config.app.s3ServicePlanId };
        const resources = [{ entity }, { entity: entity2 }];

        const result = utils.filterEntity({ resources }, basicPublic, field);

        expect(result).to.deep.equal({ entity });
      });

      it('throws an error if none of the filtered entities match the configured S3 plan', () => {
        const basicPublic = 'basic-public';
        const entity = { [field]: basicPublic, unique_id: 'foobar' };
        const resources = [{ entity }];

        const fn = () => utils.filterEntity({ resources }, basicPublic, field);

        expect(fn).to.throw(Error, `Not found: Entity @${field} = ${basicPublic} @basic-public service plan = (${config.app.s3ServicePlanId})`);
      });
    });
  });

  describe('.firstEntity', () => {
    it('should return first entity from an objects resources array', () => {
      const name = 'one';
      const field = 'name';
      const entity = { [field]: name };
      const resources = {
        resources: [
          {
            entity,
          },
          {
            entity: { [field]: 'two' },
          },
        ],
      };

      const result = utils.firstEntity(resources, name);

      expect(result).to.deep.equal({ entity });
    });

    it('should throw an error if no resources returned', () => {
      const name = 'one';
      const resources = {
        resources: [],
      };

      const fn = () => utils.firstEntity(resources, name);

      expect(fn).to.throw(Error, 'Not found');
    });
  });

  describe('.generateS3ServiceName', () => {
    it('should concat and lowercase owner and repository name', (done) => {
      const owner = 'Hello';
      const repository = 'Hello World';
      const expected = 'o-hello-r-hello-world';

      expect(utils.generateS3ServiceName(owner, repository)).to.equal(expected);
      done();
    });

    it('should convert to string when the owner and repository is a number', (done) => {
      const owner = 12345;
      const repository = 'Hello World';
      const expected = 'o-12345-r-hello-world';

      expect(utils.generateS3ServiceName(owner, repository)).to.equal(expected);
      done();
    });

    it('should truncate names over 46 characters to account for CF service name limits', (done) => {
      const owner = 'hello-world-owner';
      const repository = 'hello-world-really-long-repository-name';
      const output = utils.generateS3ServiceName(owner, repository);
      const expectedPre = 'o-hello-world-owner-r-hello-world-reall-';

      expect(output.length).to.equal(46);
      expect(output.slice(0, 40)).to.equal(expectedPre);
      done();
    });

    it('should return undefined when owner or repository or both are undefined or empty strings', (done) => {
      const aString = 'hello';
      const emptyString = '';

      expect(utils.generateS3ServiceName(aString)).to.be.undefined;
      expect(utils.generateS3ServiceName(undefined, aString)).to.be.undefined;
      expect(utils.generateS3ServiceName()).to.be.undefined;
      expect(utils.generateS3ServiceName(emptyString, emptyString)).to.be.undefined;
      done();
    });
  });

  describe('.isPastAuthThreshold', () => {
    const threshAmount = config.policies.authRevalidationMinutes;

    it(`returns true when given datetime is older than ${threshAmount} minutes`, (done) => {
      const expiredAuthDate = moment().subtract(threshAmount + 5, 'minutes').toDate();
      expect(utils.isPastAuthThreshold(expiredAuthDate)).to.equal(true);
      done();
    });

    it(`returns false when given datetime is newer than ${threshAmount} minutes`, (done) => {
      const goodAuthDate = moment().subtract(threshAmount - 5, 'minutes').toDate();
      expect(utils.isPastAuthThreshold(goodAuthDate)).to.equal(false);
      done();
    });
  });

  describe('.getDirectoryFiles', () => {
    afterEach(() => {
      fsMock.restore();
    });

    it('returns a listing of all files in the given directory', () => {
      fsMock({
        mydir: {
          'foobar.html': 'foobar content',
          subdir: {
            'beep.txt': 'beep content',
            'boop.txt': 'boop content',
          },
        },
      });

      const result = utils.getDirectoryFiles('mydir');
      expect(result).to.have.length(3);
      expect(result).to.deep.equal([
        'mydir/foobar.html',
        'mydir/subdir/beep.txt',
        'mydir/subdir/boop.txt',
      ]);
    });
  });

  describe('.loadDevelopmentManifest', () => {
    it('loads and uses the development webpack config', () => {
      const result = utils.loadDevelopmentManifest();
      expect(result).to.deep.eq({
        'main.js': 'publicPath/filename.js',
        'main.css': 'publicPath/filename.css',
      });
    });
  });

  describe('.loadProductionManifest', () => {
    beforeEach(() => {
      fsMock({
        'webpack-manifest.json': JSON.stringify({ manifest: 'yay' }),
      });
    });

    afterEach(() => {
      fsMock.restore();
    });

    it('loads webpack-manifest.json', () => {
      const result = utils.loadProductionManifest();
      expect(result).to.deep.eq({ manifest: 'yay' });
    });
  });

  describe('.loadAssetManifest', () => {
    beforeEach(() => {
      fsMock({
        'webpack-manifest.json': JSON.stringify({ manifest: 'yay' }),
      });
    });

    afterEach(() => {
      fsMock.restore();
    });

    it('returns the result of `loadDevelopmentManifest` when in development', () => {
      const orig = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const result = utils.loadAssetManifest();
      expect(result).to.deep.eq(utils.loadDevelopmentManifest());
      process.env.NODE_ENV = orig;
    });

    it('returns the result of `loadProductionManifest` when NOT in development', () => {
      const orig = process.env.NODE_ENV;
      process.env.NODE_ENV = 'foobar';
      const result = utils.loadAssetManifest();
      expect(result).to.deep.eq(utils.loadProductionManifest());
      process.env.NODE_ENV = orig;
    });
  });

  describe('.getSiteDisplayEnv', () => {
    const origAppEnv = config.app.app_env;

    after(() => {
      // restore the app_env
      config.app.app_env = origAppEnv;
    });

    it('returns null when app_env is production', () => {
      config.app.app_env = 'production';
      expect(utils.getSiteDisplayEnv()).to.be.null;
    });

    it('returns the app_env when app_env is not production', () => {
      config.app.app_env = 'development';
      expect(utils.getSiteDisplayEnv()).to.equal('development');
    });
  });

  describe('.mapValues', () => {
    it('maps a function over the values of an object and returns a new object with the original keys and updated values', () => {
      const obj = {
        foo: 1,
        bar: 5,
      };

      const fn = d => d * 2;

      expect(utils.mapValues(fn, obj)).to.deep.equal({ foo: 2, bar: 10 });
    });
  });

  describe('.wrapHandler', () => {
    it('wraps an async function with a catch clause and calls the `error` function of the 2nd argument', async () => {
      const spy = sinon.spy();
      const error = new Error('foobar');

      // eslint-disable-next-line no-unused-vars
      const handler = async (_req, _res, _next) => {
        throw error;
      };

      const wrappedFn = utils.wrapHandler(handler);

      await wrappedFn({}, { error: spy }, () => {});

      expect(spy.calledWith(error));
    });
  });

  describe('.wrapHandlers', () => {
    it('maps `wrapHandler` over the values of an object', async () => {
      const spy = sinon.spy();
      const error = new Error('foobar');

      const handlers = {
        // eslint-disable-next-line no-unused-vars
        foo: async (_req, _res, _next) => {
          throw error;
        },
        bar: async () => {},
      };

      const wrappedObj = utils.wrapHandlers(handlers);

      await wrappedObj.foo({}, { error: spy }, () => {});

      expect(spy.calledWith(error));
    });
  });
});
