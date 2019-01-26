import React from 'react';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import GitHubLink from '../GitHubLink';
import { BUILD } from '../../propTypes';
import buildActions from '../../actions/buildActions';
import LoadingIndicator from '../LoadingIndicator';
import RefreshBuildsButton from './refreshBuildsButton';
import { duration, timeFrom } from '../../util/datetime';
import AlertBanner from '../alertBanner';
import CreateBuildLink from '../CreateBuildLink';
import BranchViewLink from '../branchViewLink';

export const REFRESH_INTERVAL = 15 * 1000;

class SiteBuilds extends React.Component {

  static getUsername(build) {
    if (build.user) {
      return build.user.username;
    }
    return '';
  }

  static buildLogsLink(build) {
    return <Link to={`/sites/${build.site.id}/builds/${build.id}/logs`}>View logs</Link>;
  }

  static commitLink(build) {
    if (!build.commitSha) {
      return null;
    }

    const { owner, repository } = build.site;

    return (
      <span>
        <br />
        <GitHubLink
          owner={owner}
          repository={repository}
          sha={build.commitSha}
          title={build.commitSha}
          text="View commit"
        />
      </span>
    );
  }

  constructor(props) {
    super(props);
    this.state = { autoRefresh: true };
    autoBind(this, 'toggleAutoRefresh');
  }

  /* eslint-disable scanjs-rules/call_setInterval */
  componentDidMount() {
    const { fetchBuilds } = this.props.actions;
    fetchBuilds({ id: this.props.params.id });
    this.intervalHandle = setInterval(() => {
      if (this.state.autoRefresh) {
        fetchBuilds({ id: this.props.params.id });
      }
    }, REFRESH_INTERVAL);
  }
  /* eslint-enable scanjs-rules/call_setInterval */

  componentWillUnmount() {
    clearInterval(this.intervalHandle);
  }

  toggleAutoRefresh() {
    this.setState(state => ({ autoRefresh: !state.autoRefresh }));
  }

  latestBuildByBranch(builds) {
    const maxBuilds = {};
    const branchNames = [...new Set(builds.map(item => item.branch))];
    branchNames.forEach((branchName) => {
      let successes = builds.filter(b => b.branch === branchName && b.state === 'success');
      successes = successes.sort((a, b) => (new Date(b.completedAt) - new Date(a.completedAt)));
      if (successes.length > 0) {
        maxBuilds[branchName] = successes[0].id;
      }
    });
    return maxBuilds;
  }

  renderEmptyState() {
    const message = 'If this site was just added, the ' +
      'first build should be available within a few minutes.';
    return (
      <AlertBanner
        status="info"
        header="This site does not yet have any builds."
        message={message}
      >
        <RefreshBuildsButton site={this.props.site} />
      </AlertBanner>
    );
  }

  /* eslint-disable jsx-a11y/href-no-hash */
  renderBuildsTable() {
    const { site, builds, actions } = this.props;
    const { autoRefresh } = this.state;
    const previewBuilds = builds.data && this.latestBuildByBranch(builds.data);
    return (
      <div>
        <div className="log-tools">
          <div>
            <a
              href="#"
              role="button"
              onClick={this.toggleAutoRefresh}
              data-test="toggle-auto-refresh"
            >
              Auto Refresh: <b>{autoRefresh ? 'ON' : 'OFF'}</b>
            </a>
            <RefreshBuildsButton site={site} />
          </div>
        </div>
        { builds.isLoading ?
          <LoadingIndicator /> :
          <div className="table-container">
            <table
              className="usa-table-borderless log-table log-table__site-builds table-full-width"
            >
              <thead>
                <tr>
                  <th scope="col">Branch</th>
                  <th scope="col">User</th>
                  <th scope="col">Completed</th>
                  <th scope="col">Duration</th>
                  <th scope="col">Message</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {builds.data.map((build) => {
                  let message;

                  switch (build.state) {
                    case 'error':
                      message = 'This build has failed. Please view the logs for more information.';
                      break;
                    case 'processing':
                      message = 'This build is in progress';
                      break;
                    default:
                      message = 'The build completed successfully.';
                      break;
                  }

                  return (
                    <tr key={build.id}>
                      <td scope="row">
                        <div className="truncate">
                          { build.branch }
                        </div>
                        { SiteBuilds.commitLink(build) }
                        { previewBuilds[build.branch] === build.id &&
                        <BranchViewLink branchName={build.branch} site={site} showIcon /> }
                      </td>
                      <td>{ SiteBuilds.getUsername(build) }</td>
                      <td>{ timeFrom(build.completedAt) }</td>
                      <td>{ duration(build.createdAt, build.completedAt) }</td>
                      <td><pre>{ message }</pre></td>
                      <td className="table-actions">
                        { SiteBuilds.buildLogsLink(build) }
                        <br />
                        <CreateBuildLink
                          handlerParams={{ buildId: build.id, siteId: site.id }}
                          handleClick={actions.restartBuild}
                          class="usa-button usa-button-secondary"
                        >
                          Rebuild branch
                        </CreateBuildLink>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            { builds.data.length >= 100 ? <p>List only displays 100 most recent builds.</p> : null }
          </div>}
      </div>
    );
  }
  /* eslint-enable jsx-a11y/href-no-hash */

  render() {
    const { builds } = this.props;

    if (!builds.isLoading && !builds.data.length) {
      return this.renderEmptyState();
    }
    return this.renderBuildsTable();
  }
}

SiteBuilds.propTypes = {
  builds: PropTypes.shape({
    isLoading: PropTypes.boolean,
    data: PropTypes.arrayOf(BUILD),
  }),
  site: PropTypes.shape({
    id: PropTypes.number,
  }),
  params: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    fetchBuilds: PropTypes.func.isRequired,
    restartBuild: PropTypes.func.isRequired,
  }),
};

SiteBuilds.defaultProps = {
  builds: null,
  site: null,
  actions: {
    fetchBuilds: buildActions.fetchBuilds,
    restartBuild: buildActions.restartBuild,
  },
};

const mapStateToProps = state => ({
  builds: state.builds,
  site: state.sites.currentSite,
});

export { SiteBuilds };
export default connect(mapStateToProps)(SiteBuilds);
