import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import SideNav from './site/SideNav';
import PagesHeader from './site/pagesHeader';
import AlertBanner from './alertBanner';
import LoadingIndicator from './LoadingIndicator';

const propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
    branch: PropTypes.string,
    fileName: PropTypes.string,
  }).isRequired,
  storeState: PropTypes.shape({
    sites: PropTypes.object,
    builds: PropTypes.object,
    buildLogs: PropTypes.object,
    publishedBranches: PropTypes.object,
    publishedFiles: PropTypes.object,
    githubBranches: PropTypes.object,
    alert: PropTypes.shape({
      message: PropTypes.string,
      status: PropTypes.string,
    }),
  }),
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

const defaultProps = {
  children: null,
  storeState: null,
};

export const SITE_NAVIGATION_CONFIG = [
  {
    display: 'Build history',
    route: 'builds',
    iconClass: 'icon-logs',
  },
  {
    display: 'GitHub branches',
    route: 'branches',
    iconClass: 'icon-pages',
  },
  {
    display: 'Published files',
    route: 'published',
    iconClass: 'icon-upload',
  },
  {
    display: 'Collaborators',
    route: 'users',
    iconClass: 'icon-gear',
  },
  {
    display: 'Site settings',
    route: 'settings',
    iconClass: 'icon-settings',
  },
];

export class SiteContainer extends React.Component {
  getPageTitle(pathname) {
    const route = pathname.split('/').pop();
    const routeConf = SITE_NAVIGATION_CONFIG.find(conf => conf.route === route);
    if (routeConf) {
      return routeConf.display;
    }
    return '';
  }

  getCurrentSite(sitesState, siteId) {
    if (sitesState.isLoading) {
      return null;
    }

    return sitesState.data.find(site => site.id === parseInt(siteId, 10));
  }

  render() {
    const { storeState, children, params, location } = this.props;

    if (storeState.sites.isLoading || !storeState.sites.data) {
      return <LoadingIndicator />;
    }

    const site = this.getCurrentSite(storeState.sites, params.id);

    if (!site) {
      return (
        <div className="usa-alert usa-alert-error" role="alert">
          <div className="usa-alert-body">
            <h3 className="usa-alert-heading">Unauthorized</h3>
            <p className="usa-alert-text">
              Apologies; you don&apos;t have access to this site in Federalist!
              <br />
              Please contact the site owner if you should have access.
            </p>
          </div>
        </div>
      );
    }

    const pageTitle = this.getPageTitle(location.pathname);
    const builds = storeState.builds;
    const buildLogs = storeState.buildLogs;
    const publishedBranches = storeState.publishedBranches;
    const publishedFiles = storeState.publishedFiles;
    const githubBranches = storeState.githubBranches;
    const user = storeState.user.data;

    const childConfigs = {
      site,
      builds,
      buildLogs,
      publishedBranches,
      publishedFiles,
      githubBranches,
      user,
    };

    return (
      <div className="usa-grid site">
        <SideNav siteId={site.id} />
        <div className="usa-width-five-sixths site-main" id="pages-container">

          <AlertBanner
            message={storeState.alert.message}
            status={storeState.alert.status}
          />

          <PagesHeader
            repository={site.repository}
            owner={site.owner}
            title={pageTitle}
            siteId={site.id}
            branch={params.branch || site.defaultBranch}
            fileName={params.fileName}
            viewLink={site.viewLink}
          />
          <div className="">
            {children &&
              React.cloneElement(children, childConfigs)
            }
          </div>
        </div>
      </div>
    );
  }
}

SiteContainer.propTypes = propTypes;
SiteContainer.defaultProps = defaultProps;

export default connect(state => state)(SiteContainer);
