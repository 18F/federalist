const Seq = require('sequelize');
const { wrapHandlers } = require('../utils');
const buildLogSerializer = require('../serializers/build-log');
const { Build, BuildLog } = require('../models');

function decodeb64(str) {
  if (str) {
    return Buffer.from(str, 'base64').toString('utf8');
  }
  return null;
}

module.exports = wrapHandlers({
  create: async (req, res) => {
    const { build_id: buildId, token } = req.params;

    const build = await Build.findOne({ where: { id: buildId, token } });

    if (!build) {
      return res.notFound();
    }

    const { output, source } = req.body;

    const buildLog = await BuildLog.create({
      build: build.id,
      output: decodeb64(output),
      source,
    });

    const buildLogJSON = await buildLogSerializer.serialize(buildLog);

    return res.ok(buildLogJSON);
  },

  find: async (req, res) => {
    const limit = 5;
    // A page is set to a maximum of 200,000 characters. Assuming
    // a each log line is about 200 characters, that is roughly
    // equal to 1,000 lines
    const lineLimit = 5 * 1000;

    const { params, user } = req;
    const { build_id: buildId, page = 1 } = params;

    const build = await Build.forUser(user).findByPk(buildId);

    if (!build) {
      return res.notFound();
    }

    // I think it will be more efficient to aggregate these at the db level...
    // attributes: [[Seq.fn('STRING_AGG', Seq.col('output'), '\n'), 'output']]
    // group: ['build', 'source']
    let buildLogs = await BuildLog.findAll({
      where: {
        build: build.id,
        source: 'ALL',
      },
      order: [['id', 'ASC']],
      offset: (lineLimit * (page - 1)),
      lineLimit,
      include: [Build],
    });

    // Support legacy build logs
    if (buildLogs.length === 0) {
      buildLogs = await BuildLog.findAll({
        where: {
          build: build.id,
          source: { [Seq.Op.ne]: 'ALL' },
        },
        order: [['id', 'ASC']],
        offset: (limit * (page - 1)),
        limit,
        include: [Build],
      });
    }

    const serializedBuildLogs = await buildLogSerializer.serialize(buildLogs);

    return res.ok(serializedBuildLogs);
  },
});
