import React from 'react';

import SiteListItem from './siteListItem';
import LinkButton from '../linkButton';

class SiteList extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {
    const store = this.props.storeState;

    let content = (
      <div className="usa-grid">
        <h1>No sites yet.</h1>
        <p>Add one now.</p>
      </div>
    );

    if (store.sites.length) {
      content = (
        <div className="usa-grid">
          <h2>Websites</h2>
          <ul className="sites-list">
            { store.sites.map((site) => {
                return <SiteListItem key={ site.id } site={ site } />
            })}
          </ul>
        </div>
      );
    }

    return (
      <div>
        <div className="usa-grid dashboard header">
          <div className="usa-width-two-thirds">
            <img className="header-icon" src="/images/websites.svg" alt="Websites icon" />
            <div className="header-title">
              <h1>Your Websites</h1>
              <p>Dashboard</p>
            </div>
          </div>
          <div className="usa-width-one-third">
            <LinkButton
              className="usa-button-big pull-right icon icon-new icon-white"
              href={'/sites/new'}
              alt="Add a new website"
              text="Add Website" />
          </div>
        </div>
        { content }
        <div className="usa-grid">
          <div className="usa-width-one-whole">
            <LinkButton
              className="usa-button-big pull-right icon icon-new icon-white"
              href={'/sites/new'}
              alt="Add a new website"
              text="Add Website" />
          </div>
        </div>

      </div>
    );
  }
}

// SiteList.propTypes = {
//   sites: React.PropTypes.array
// };

export default SiteList;
