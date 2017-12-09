const expect = require('chai').expect;
const moment = require('moment');
const fsMock = require('mock-fs');

const config = require('../../../../config');
const utils = require('../../../../api/utils');


describe('utils', () => {
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

  describe('.loadAssetManifest', () => {
    afterEach(() => {
      fsMock.restore();
    });

    it('loads webpack-manifest.json', () => {
      fsMock({
        'webpack-manifest.json': JSON.stringify({ manifest: 'yay' }),
      });

      const result = utils.loadAssetManifest();
      expect(result).to.deep.eq({ manifest: 'yay' });
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
});
