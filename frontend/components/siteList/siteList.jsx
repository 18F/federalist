import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import { connect } from 'react-redux';

import {
  SITE, ALERT, USER, ORGANIZATION,
} from '../../propTypes';
import { getOrgById, orgFilter } from '../../selectors/organization';
import { groupSitesByOrg } from '../../selectors/site';
import AlertBanner from '../alertBanner';
import UserOrgSelect from '../organization/UserOrgSelect';
import SiteListItem from './siteListItem';
import LoadingIndicator from '../LoadingIndicator';
import GithubAuthButton from '../GithubAuthButton';
import { IconPlus } from '../icons';
import alertActions from '../../actions/alertActions';
import userActions from '../../actions/userActions';

const hasGithubAuth = user => !!user.email;

const onGithubAuthSuccess = () => {
  userActions.fetchUser();
  alertActions.alertSuccess('Github authorization successful');
};

const onGithubAuthFailure = (error) => {
  alertActions.alertError(error.message);
};

const mapSites = (organizations, siteData, user) => (
  siteData
    .slice() // create a copy so that sort doesn't modify the original
    .sort((a, b) => a.id - b.id) // sort by id ascending
    .map((site) => {
      const { organizationId } = site;
      const organization = getOrgById(organizations, organizationId);
      return (
        <SiteListItem
          key={site.id}
          organization={organization}
          site={site}
          user={user}
        />
      );
    })
);

const getSites = (organizations, sites, user) => {
  const { isLoading, data } = sites;

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!data || !data.length) {
    return (
      <div className="usa-grid">
        <h1>No sites yet.</h1>
        <p>Add one now.</p>
      </div>
    );
  }

  return (
    <ul className="sites-list usa-unstyled-list">
      {mapSites(organizations, data, user)}
    </ul>
  );
};

export const SiteList = ({
  organizations, orgFilterOptions, sites, user, alert,
}) => {
  const [orgFilterValue, setOrgFilterValue] = useState('all-options');
  const groupedSites = groupSitesByOrg(sites, orgFilterValue);

  return (
    <div>
      <div className="page-header usa-grid-full">
        <div className="usa-width-two-thirds">
          <h1>
            Your sites
          </h1>
        </div>
        <div className="usa-width-one-third header-actions">
          {
            hasGithubAuth(user)
              ? (
                <Link
                  to="/sites/new"
                  role="button"
                  className="usa-button button-add-website"
                  alt="Add a new site"
                >
                  <IconPlus />
                  {' '}
                  Add site
                </Link>
              )
              : <GithubAuthButton onSuccess={onGithubAuthSuccess} onFailure={onGithubAuthFailure} />
          }
        </div>
      </div>
      {
        orgFilterOptions
          ? (
            <div className="page-header usa-grid-full">
              <div className="usa-width-one-third">
                <UserOrgSelect
                  id="filter-sites-by-org"
                  label="Filter sites by organization."
                  name="filter-sites-by-org"
                  orgData={orgFilterOptions}
                  value={orgFilterValue}
                  onChange={({ target: { value } }) => setOrgFilterValue(value)}
                />
              </div>
            </div>
          ) : null
      }

      <AlertBanner {...alert} />
      {getSites(organizations, groupedSites, user)}
      <a href="#top" className="back-to-top">Return to top</a>
    </div>
  );
};

SiteList.propTypes = {
  alert: ALERT,
  organizations: PropTypes.shape({
    data: PropTypes.arrayOf(ORGANIZATION),
    isLoading: PropTypes.bool,
  }),
  orgFilterOptions: PropTypes.arrayOf(PropTypes.object),
  sites: PropTypes.shape({
    data: PropTypes.arrayOf(SITE),
    isLoading: PropTypes.bool,
  }),
  user: USER.isRequired,
};

SiteList.defaultProps = {
  alert: null,
  organizations: null,
  orgFilterOptions: null,
  sites: null,
};

const mapStateToProps = ({
  alert, organizations, sites, user,
}) => ({
  alert,
  organizations,
  orgFilterOptions: orgFilter(organizations),
  sites,
  user: user.data,
});

export default connect(mapStateToProps)(SiteList);
