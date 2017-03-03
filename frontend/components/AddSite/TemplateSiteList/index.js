import React from 'react';

import TemplateSite from './templateSite';

const propTypes = {
  templates: React.PropTypes.object.isRequired,
  handleSubmitTemplate: React.PropTypes.func.isRequired
}

class TemplateList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeChildId: -1
    };

    this.handleChooseActive = this.handleChooseActive.bind(this);
  }

  handleChooseActive(childId) {
    this.setState({
      activeChildId: childId
    });
  }

  render() {
    const { templates } = this.props;

    return (
      <div>
        <div className="usa-grid">
          <div className="usa-width-one-whole">
            <h2>Choose from one of our templates</h2>
          </div>
        </div>
        <div className="usa-grid">
          {Object.keys(templates).map((templateName, index) => {
            const template = templates[templateName];

            return (
              <TemplateSite
                name={templateName}
                key={index}
                index={index}
                thumb={templateName}
                active={this.state.activeChildId}
                handleChooseActive={this.handleChooseActive}
                handleSubmit={this.props.handleSubmitTemplate}
                defaultOwner={this.props.defaultOwner}
                {...template} />
            );
          })}
        </div>
      </div>
    );
  }
}

TemplateList.propTypes = propTypes;

export default TemplateList;
