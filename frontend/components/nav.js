import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';

const propTypes = {
  username: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ])
};

const getSecondaryNav = (username) => {
  const links = getSecondaryNavLinks(username);

  return links.map((link, index) => {
    return <li key={index}>{link}</li>;
  });
};

const getSecondaryNavLinks = (username) => {
  if (username) {
    return [
      <Link to="/sites">{username}</Link>,
      <a href="https://federalist-docs.18f.gov" target="_blank">Documentation</a>,
      <a href="https://github.com/18F/federalist/issues/new" target="_blank">File Issue</a>,
      <a href="mailto:federalist-support@gsa.gov">Get Help</a>,
      <a href="/logout">Log out</a>,
    ]
  } else {
    return [
      <a href="https://federalist-docs.18f.gov" target="_blank">Documentation</a>,
      <a href="https://github.com/18F/federalist/issues/new" target="_blank">Contact Us</a>,
      <a href="/auth/github">Log in</a>,
    ]
  }
}

const Nav = ({ username = null }) =>
  <nav className="usa-site-navbar">
    <div className="usa-grid">
      <div className="nav-elements">
        <div className="logo" id="logo">
          <a href="/" accessKey="1" title="Home" aria-label="Home">Federalist logo</a>
        </div>
        <div className="navbar-links" id="navbar-links">
          <ul className="" id="nav-mobile">
            {getSecondaryNav(username)}
          </ul>
        </div>
      </div>
    </div>
  </nav>

Nav.propTypes = propTypes;

export default Nav;
