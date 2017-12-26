const protectedAttributes = [
  'githubAccessToken',
  'githubUserId',
  'signedInAt',
  'site_users__user_sites',
];
const associate = ({ User, Build, Site, UserAction }) => {
  User.hasMany(Build, {
    foreignKey: 'user',
  });
  User.belongsToMany(Site, {
    through: 'site_users__user_sites',
    foreignKey: 'user_sites',
    timestamps: false,
  });
  User.hasMany(UserAction, {
    foreignKey: 'userId',
    as: 'userActions',
  });
  User.belongsToMany(User, {
    through: 'user_action',
    as: 'actionTarget',
    foreignKey: 'targetId',
    unique: false,
  });
};

function toJSON() {
  const record = this.get({
    plain: true,
  });
  /* eslint-disable no-param-reassign */
  return Object.assign({}, Object.keys(record).reduce((out, attr) => {
    if (protectedAttributes.indexOf(attr) !== -1) {
      return out;
    }

    out[attr] = record[attr];

    return out;
  }, {}), {
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  });
  /* eslint-enable */
}

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    githubAccessToken: {
      type: DataTypes.STRING,
    },
    githubUserId: {
      type: DataTypes.STRING,
    },
    signedInAt: {
      type: DataTypes.DATE,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  }, {
    tableName: 'user',
    classMethods: {
      associate,
    },
    instanceMethods: {
      toJSON,
    },
    paranoid: true,
  });

  return User;
};
