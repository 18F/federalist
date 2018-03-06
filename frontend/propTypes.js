import PropTypes from 'prop-types';

export const ALERT = PropTypes.shape({
  message: PropTypes.string,
  status: PropTypes.string,
  stale: PropTypes.bool,
});

export const USER = PropTypes.shape({
  id: PropTypes.number,
  email: PropTypes.string,
  username: PropTypes.string,
});

export const SITE = PropTypes.shape({
  owner: PropTypes.string,
  repository: PropTypes.string,
  demoBranch: PropTypes.string,
  demoDomain: PropTypes.string,
  config: PropTypes.string,
  previewConfig: PropTypes.string,
  demoConfig: PropTypes.string,
  defaultBranch: PropTypes.string,
  domain: PropTypes.string,
  engine: PropTypes.string,
  users: PropTypes.arrayOf(USER),
});

export const GITHUB_BRANCHES = PropTypes.shape({
  error: PropTypes.object,
  isLoading: PropTypes.bool.isRequired,
  data: PropTypes.array,
});

export const BUILD = PropTypes.shape({
  id: PropTypes.number,
  state: PropTypes.string,
  error: PropTypes.string,
  branch: PropTypes.string,
  commitSha: PropTypes.string,
  completedAt: PropTypes.string,
  createdAt: PropTypes.string,
  user: PropTypes.shape({
    username: PropTypes.string,
  }),
});

export const BUILD_LOG = PropTypes.shape({
  id: PropTypes.number.isRequired,
  source: PropTypes.string.isRequired,
  output: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
});

export const USER_ACTION = PropTypes.shape({
  targetType: PropTypes.string,
  createdAt: PropTypes.string,
  actionTarget: USER,
  actionType: PropTypes.shape({ action: PropTypes.string }),
  initiator: USER,
});
