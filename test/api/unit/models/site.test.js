const { expect } = require('chai');
const factory = require('../../support/factory');
const { Site } = require('../../../../api/models');

function clean() {
  return factory.organization.truncate();
}

describe('Site model', () => {
  beforeEach(clean);

  after(clean);

  describe('before validate hook', () => {
    it('should lowercase the owner and repository values', (done) => {
      factory.site({
        owner: 'RepoOwner',
        repository: 'RepoName',
      }).then((site) => {
        expect(site.owner).to.equal('repoowner');
        expect(site.repository).to.equal('reponame');
        done();
      }).catch(done);
    });
  });

  describe('.withUsers', () => {
    it('returns the site object with user association', () => {
      factory.site({
        users: Promise.all([factory.user()]),
      }).then(site => Site.withUsers(site.id))
        .then((site) => {
          expect(site.Users).to.be.an('array');
          expect(site.Users.length).to.equal(1);
        });
    });
  });

  it('should not let the domain and demoDomain be equal', (done) => {
    factory.site({
      domain: 'https://www.example.gov',
      demoDomain: 'https://www.example.gov',
    }).catch((err) => {
      expect(err.status).to.equal(403);
      expect(err.message).to.equal('Domain and demo domain cannot be the same');
      done();
    }).catch(done);
  });

  it('should not let the defaultBranch and demoBranch be equal', (done) => {
    factory.site({
      defaultBranch: 'preview',
      demoBranch: 'preview',
    }).catch((err) => {
      expect(err.status).to.equal(403);
      expect(err.message).to.equal('Default branch and demo branch cannot be the same');
      done();
    }).catch(done);
  });

  it('should validate that the domain is a valid URL', (done) => {
    factory.site({
      domain: 'boop://beep.com',
    }).catch((err) => {
      expect(err.status).to.equal(403);
      expect(err.message).to.equal('domain: URL must start with https://');
      done();
    }).catch(done);
  });

  it('should validate that the demoDomain is a valid URL', (done) => {
    factory.site({
      demoDomain: 'beep.com',
    }).catch((err) => {
      expect(err.status).to.equal(403);
      expect(err.message).to.equal('demoDomain: URL must start with https://');
      done();
    }).catch(done);
  });

  it('should validate the primary branch name is valid', (done) => {
    factory.site({
      defaultBranch: 'very*bad',
    }).catch((err) => {
      expect(err.status).to.equal(403);
      expect(err.message).to.equal('defaultBranch: Invalid branch name — branches can only contain alphanumeric characters, underscores, and hyphens.');
      done();
    });
  });

  it('should validate the demo branch name is valid', (done) => {
    factory.site({
      demoBranch: 'in@valid',
    }).catch((err) => {
      expect(err.status).to.equal(403);
      expect(err.message).to.equal('demoBranch: Invalid branch name — branches can only contain alphanumeric characters, underscores, and hyphens.');
      done();
    });
  });

  it('should validate the primary branch name is valid no leading slash', (done) => {
    factory.site({
      defaultBranch: '/very-bad',
    }).catch((err) => {
      expect(err.status).to.equal(403);
      expect(err.message).to.equal('defaultBranch: Invalid branch name — branches can only contain alphanumeric characters, underscores, and hyphens.');
      done();
    });
  });

  it('should validate the demo branch name is valid no trailing slashes', (done) => {
    factory.site({
      demoBranch: 'invalid/',
    }).catch((err) => {
      expect(err.status).to.equal(403);
      expect(err.message).to.equal('demoBranch: Invalid branch name — branches can only contain alphanumeric characters, underscores, and hyphens.');
      done();
    });
  });

  it('should validate the primary branch name is valid -no leading hyphen', (done) => {
    factory.site({
      defaultBranch: '-very-bad',
    }).catch((err) => {
      expect(err.status).to.equal(403);
      expect(err.message).to.equal('defaultBranch: Invalid branch name — branches can only contain alphanumeric characters, underscores, and hyphens.');
      done();
    });
  });

  it('should validate the demo branch name is valid no trailing hyphen', (done) => {
    factory.site({
      demoBranch: 'invalid-',
    }).catch((err) => {
      expect(err.status).to.equal(403);
      expect(err.message).to.equal('demoBranch: Invalid branch name — branches can only contain alphanumeric characters, underscores, and hyphens.');
      done();
    });
  });

  it('should not let s3ServiceName field be null', (done) => {
    factory.site({
      s3ServiceName: undefined,
    }).catch((err) => {
      expect(err.status).to.equal(403);
      expect(err.message).to.equal('s3ServiceName: Site.s3ServiceName cannot be null');
      done();
    });
  });

  it('should not let awsBucketName field be null', (done) => {
    factory.site({
      awsBucketName: undefined,
    }).catch((err) => {
      expect(err.status).to.equal(403);
      expect(err.message).to.equal('awsBucketName: Site.awsBucketName cannot be null');
      done();
    });
  });

  it('should not let awsBucketRegion field be null', (done) => {
    factory.site({
      awsBucketRegion: undefined,
    }).catch((err) => {
      expect(err.status).to.equal(403);
      expect(err.message).to.equal('awsBucketRegion: Site.awsBucketRegion cannot be null');
      done();
    });
  });

  it('should not let subdomain field be null', (done) => {
    factory.site({
      subdomain: undefined,
    }).catch((err) => {
      expect(err.status).to.equal(403);
      expect(err.message).to.equal('subdomain: Site.subdomain cannot be null');
      done();
    });
  });

  it('should validate that the subdomain is only alpahnumeric and hyphen', (done) => {
    const subdomain = 'inva.l1d';
    const errMsg = 'subdomain: Subdomains may only contain up to 63 alphanumeric and hyphen characters.';
    factory.site({
      subdomain,
    }).catch((err) => {
      expect(err.status).to.equal(403);
      expect(err.message).to.equal(errMsg);
      done();
    });
  });

  it('should validate that the subdomain is <= 63 characters', (done) => {
    const subdomain = '0123456789012345678901234567890123456789012345678901234567890123';
    const errMsg = 'subdomain: Subdomains may only contain up to 63 alphanumeric and hyphen characters.';
    factory.site({
      subdomain,
    }).catch((err) => {
      expect(err.status).to.equal(403);
      expect(err.message).to.equal(errMsg);
      done();
    });
  });

  it('should validate that the subdomain is unique', async () => {
    const errMsg = 'subdomain: Subdomains may only contain up to 63 alphanumeric and hyphen characters.';
    const site = await factory.site();

    const error = await factory.site({ subdomain: site.subdomain }).catch(e => e);

    expect(error).to.be.a('error');
    expect(error.message).to.equal('Validation error');
  });

  it('can belong to an organization', async () => {
    const [site, org] = await Promise.all([
      factory.site(),
      factory.organization.create(),
    ]);

    expect(await site.getOrganization()).to.be.null;

    await site.setOrganization(org);

    expect((await site.getOrganization()).equals(org)).to.be.true;
  });
});
