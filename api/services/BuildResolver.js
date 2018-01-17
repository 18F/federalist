const { User, Build, Site } = require('../models');
const buildErrors = require('../responses/buildErrors');
const GitHub = require('../services/GitHub');

const rejectBuild = msg =>
  Promise.reject({
    status: 404,
    message: msg,
  });

const getBranch = ({ user, site, branch }) =>
  GitHub.getBranch(user, site.owner, site.repository, branch)
  .then(branchInfo => ({
    branch: branchInfo.name,
    site: site.id,
    commitSha: branchInfo.commit.sha,
  }))
  .catch(() => rejectBuild(buildErrors.BRANCH_NOT_FOUND));

const getBuildById = (user, params) => {
  const { buildId, siteId } = params;

  return Build.findOne({
    where: {
      id: buildId,
      site: siteId,
    }
  })
  .then((model) => {
    if (model) {
      return model;
    }

    return rejectBuild(buildErrors.BUILD_NOT_FOUND);
  });
};

const getBuildByBranch = (user, params) => {
  const { siteId, sha, branch } = params;

  return Site.findOne({
    where: { id: siteId },
    attributes: ['id', 'owner', 'repository'],
    include: {
      model: Build,
      where: { branch },
      required: false,
    },
  })
  .then((model) => {
    const site = model;
    const build = site.Builds && site.Builds[0];

    // The branch we want to create a new build from has been built via federalist before
    if (build) {
      return Object.assign({}, build.toJSON(), { commitSha: sha });
    }

    // We don't have a build record, using this branch, go to github and check if the
    // requested branch is a valid one for the current site.
    return getBranch({ user, site, branch });
  });
};

const BuildResolver = {
  getBuild(user, params) {
    const finderFn = params.buildId ? getBuildById : getBuildByBranch;

    return finderFn(user, params);
  }
};

module.exports = BuildResolver;
