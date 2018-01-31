import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { Link } from 'react-router';

import BranchField from '../Fields/BranchField';
import GitHubRepoUrlField from '../Fields/GitHubRepoUrlField';
import SelectSiteEngine from '../SelectSiteEngine';
import AlertBanner from '../alertBanner';

const propTypes = {
  showAddNewSiteFields: PropTypes.bool,

  initialValues: PropTypes.shape({
    engine: PropTypes.string.isRequired,
  }).isRequired,
  // the following props are from reduxForm:
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
};

const defaultProps = {
  showAddNewSiteFields: false,
};

const showNewSiteAlert = () => {
  const message = (
    <span>
      Looks like this site is completely new to Federalist!
      <br />
      Please fill out these additional fields to complete the process.
    </span>
  );

  return <AlertBanner status="info" heading="New Site" message={message} />;
};

export const AddRepoSiteForm = ({
  // even though initialValues is not directly used, it is used
  // by reduxForm, and we want PropType validation on it, so we'll
  // keep it here but disable the eslint rule below
  initialValues, // eslint-disable-line no-unused-vars
  pristine,
  handleSubmit,
  showAddNewSiteFields,
}) => (
  <form onSubmit={handleSubmit}>
    <div className="form-group">
      <GitHubRepoUrlField
        label="GitHub Repository URL"
        help={
          <span>
            Paste your repository&apos;s GitHub URL here.
            <br />
            For example: https://github.com/18f/federalist-docs
          </span>
        }
        name="repoUrl"
        id="repoUrl"
        placeholder="https://github.com/owner/repository"
        className="form-control"
        readOnly={showAddNewSiteFields}
      />
    </div>
    {
      showAddNewSiteFields && (
      <div className="add-repo-site-additional-fields">
        {showNewSiteAlert()}
        <div className="form-group">
          <label htmlFor="engine">Static site engine</label>
          <Field
            name="engine"
            id="engine"
            component={p =>
              <SelectSiteEngine
                value={p.input.value}
                onChange={p.input.onChange}
                className="form-control"
              />
            }
          />
        </div>
        <div className="form-group">
          <BranchField
            label="Primary branch"
            type="text"
            id="defaultBranch"
            className="form-control"
            placeholder="master"
            name="defaultBranch"
            required
          />
        </div>
      </div>
    )}
    <Link
      role="button"
      to="/sites"
      className="usa-button usa-button-secondary"
    >
      Cancel
    </Link>
    <button
      type="submit"
      className="usa-button usa-button-primary"
      style={{ display: 'inline-block' }}
      disabled={pristine}
    >
      Submit repository-based site
    </button>
  </form>
);

AddRepoSiteForm.propTypes = propTypes;
AddRepoSiteForm.defaultProps = defaultProps;

// create a higher-order component with reduxForm and export that
export default reduxForm({ form: 'addRepoSite' })(AddRepoSiteForm);
