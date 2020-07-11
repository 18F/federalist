// use dynamodb helper to write items to dynamodb
const { DynamoDBDocumentHelper } = require('./DynamoDBDocumentHelper');
const config = require('../../config');

const tableName = config.app.proxySiteTable;
const siteKey = 'id';
const getSiteKey = site => site.subdomain;

const siteToItem = (site) => {
  const item = {
    settings: {
      bucket_name: site.awsBucketName,
      bucket_region: site.awsBucketRegion,
    },
  };

  if (site.config.basicAuth && site.config.basicAuth.username && site.config.basicAuth.password) {
    item.settings.basicAuth = site.config.basicAuth;
  }

  item[siteKey] = getSiteKey(site);
  return item;
};

const removeSite = (site) => {
  const docClient = new DynamoDBDocumentHelper(config.dynamoDB);
  const key = { [siteKey]: getSiteKey(site) };
  return docClient.delete(tableName, key);
};

const saveSite = (site) => {
  const docClient = new DynamoDBDocumentHelper(config.dynamoDB);
  const item = siteToItem(site);
  return docClient.put(tableName, item);
};

const saveSites = (sites) => {
  const docClient = new DynamoDBDocumentHelper(config.dynamoDB);
  const items = sites.map(site => ({ PutRequest: { Item: siteToItem(site) } }));
  return docClient.batchWrite(tableName, items);
};

module.exports = {
  saveSite, saveSites, removeSite, siteToItem, getSiteKey,
};