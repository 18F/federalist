import React from 'react';

const propTypes = {
  message: React.PropTypes.string.isRequired,
  type: React.PropTypes.string.isRequired
};

const AlertBanner = (props) =>
  !props.message ? null :
  <div className="usa-grid">
    <div className="alert-container container">
      <div
        className={`usa-alert usa-alert-${props.status} new-site-error`}
        role="alert"
      >
        {props.message}
      </div>
    </div>
  </div>;

export default AlertBanner;
