import React from 'react';
import PropTypes from 'prop-types';

const InputWithErrorField = ({
  id,
  placeholder,
  label,
  help,
  meta: { touched, error }, // from the Field component
  // eslint-disable-next-line react/prop-types
  input, // from the Field component
  type,
  ...props
}) => (
  <div className={touched && error ? 'usa-input-error' : ''}>
    { label && <label htmlFor={id}>{ label }</label> }
    { help }
    {touched && (error && <span className="usa-input-error-message">{error}</span>)}
    <input
      {...input}
      {...props}
      placeholder={placeholder}
      type={type}
      id={id}
      autoComplete="off"
    />
  </div>
);

InputWithErrorField.propTypes = {
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  help: PropTypes.node,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
  }).isRequired,
  type: PropTypes.string,
};

InputWithErrorField.defaultProps = {
  help: null,
  type: 'url',
};

export default InputWithErrorField;
