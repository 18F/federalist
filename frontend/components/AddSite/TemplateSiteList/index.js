import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import TemplateSite from './templateSite';

const propTypes = {
  templates: PropTypes.object.isRequired,
  handleSubmitTemplate: PropTypes.func.isRequired,
  defaultOwner: PropTypes.string.isRequired,
};

export class TemplateList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeChildId: -1,
    };

    this.handleChooseActive = this.handleChooseActive.bind(this);
  }

  handleChooseActive(childId) {
    this.setState({
      activeChildId: childId,
    });
  }

  render() {
    const { templates } = this.props;

    const templateGrid = Object.keys(templates).map((templateName, index) => {
      const template = templates[templateName];

      return (
        <div className="federalist-template-list" key={templateName}>
          <TemplateSite
            name={template.title}
            index={index}
            thumb={template.thumb}
            active={this.state.activeChildId}
            handleChooseActive={this.handleChooseActive}
            handleSubmit={this.props.handleSubmitTemplate}
            defaultOwner={this.props.defaultOwner}
            {...template}
          />
        </div>
      );
    });

    return (
      <div>
        <h2>Or choose from one of our templates</h2>
        {templateGrid}
      </div>
    );
  }
}

TemplateList.propTypes = propTypes;

const mapStateToProps = state => ({
  templates: state.FRONTEND_CONFIG.TEMPLATES,
});

export default connect(mapStateToProps)(TemplateList);
