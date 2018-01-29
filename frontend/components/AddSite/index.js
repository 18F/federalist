import React from 'react';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';

import TemplateSiteList from './TemplateSiteList';
import AddRepoSiteForm from './AddRepoSiteForm';
import AlertBanner from '../alertBanner';
import { availableEngines } from '../SelectSiteEngine';

import siteActions from '../../actions/siteActions';
import addNewSiteFieldsActions from '../../actions/addNewSiteFieldsActions';

const propTypes = {
  storeState: PropTypes.shape({
    user: PropTypes.shape({
      username: PropTypes.string,
      id: PropTypes.number,
    }),
    error: PropTypes.string,
  }),
  showAddNewSiteFields: PropTypes.bool,
};

const defaultProps = {
  storeState: null,
  showAddNewSiteFields: false,
};

function getOwnerAndRepo(repoUrl) {
  const owner = repoUrl.split('/')[3];
  const repository = repoUrl.split('/')[4];

  return { owner, repository };
}

export class AddSite extends React.Component {
  constructor(props) {
    super(props);

    autoBind(
      this,
      'onAddUserSubmit',
      'onCreateSiteSubmit',
      'onSubmitTemplate'
    );
  }

  componentWillUnmount() {
    // dispatch the action to hide the additional new site fields
    // when this component is unmounted
    addNewSiteFieldsActions.hideAddNewSiteFields();
  }

  onAddUserSubmit({ repoUrl }) {
    const { owner, repository } = getOwnerAndRepo(repoUrl);
    siteActions.addUserToSite({ owner, repository });
  }

  onCreateSiteSubmit({ repoUrl, engine, defaultBranch }) {
    const { owner, repository } = getOwnerAndRepo(repoUrl);
    siteActions.addSite({ owner, repository, engine, defaultBranch });
  }

  onSubmitTemplate(site) {
    siteActions.addSite(site);
  }

  defaultOwner() {
    const userState = this.props.storeState.user;
    if (userState.data) {
      return userState.data.username;
    }
    return '';
  }

  render() {
    // select the function to use on form submit based on
    // the showAddNewSiteFields flag
    const formSubmitFunc = this.props.showAddNewSiteFields ?
      this.onCreateSiteSubmit : this.onAddUserSubmit;

    return (
      <div>
        <AlertBanner message={this.props.storeState.error} />
        <div className="usa-grid">
          <div className="page-header usa-grid-full">
            <div className="header-title">
              <h1>
                <img className="header-icon" src="/images/website.svg" alt="Websites icon" />
                Make a new site
              </h1>
            </div>
          </div>
          <p>
            There are a few different ways you can add sites to Federalist.
            You can start with a brand new site by selecting one of our template sites below.
            Or you can specify the GitHub repository where your site&#39;s code lives.
          </p>

          <TemplateSiteList
            handleSubmitTemplate={this.onSubmitTemplate}
            defaultOwner={this.defaultOwner()}
          />

          <h2>Or add your own GitHub repository</h2>

          <AddRepoSiteForm
            initialValues={{ engine: availableEngines[0].value }}
            showAddNewSiteFields={this.props.showAddNewSiteFields}
            onSubmit={formSubmitFunc}
          />
        </div>
      </div>
    );
  }
}

AddSite.propTypes = propTypes;
AddSite.defaultProps = defaultProps;

const mapStateToProps = ({ showAddNewSiteFields }) => ({ showAddNewSiteFields });

export default connect(mapStateToProps)(AddSite);
