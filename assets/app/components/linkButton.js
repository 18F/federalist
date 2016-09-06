import React from 'react';
import { Link } from 'react-router';


const propTypes = {
  className: React.PropTypes.string,
  text: React.PropTypes.string,
  href: React.PropTypes.string
}

const LinkButton = ({ className, children, text, href, alt, target }) =>
  <Link role="button"
    to={href}
    className={`usa-button ${className}`}
    alt={alt}
    target={target}
  >{text || children}</Link>;

LinkButton.propTypes = propTypes;

export default LinkButton;
