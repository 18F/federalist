import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { USER_ACTION } from '../../propTypes';
import { dayAndDate } from '../../util/datetime';
import userActions from '../../actions/userActions';

const propTypes = {
  site: PropTypes.number.isRequired,
  userActions: PropTypes.arrayOf(USER_ACTION),
};

class UserActionsTable extends React.Component {
  componentDidMount() {
    userActions.fetchUserActions(this.props.site);
  }

  renderRow(action) {
    return (
      <tr key={`${action.id}-${action.targetType}`}>
        <td>{action.actionType.action}</td>
        <td>{action.actionTarget.username}</td>
        <td>{dayAndDate(action.createdAt)}</td>
      </tr>
    );
  }

  renderTableHead() {
    return (
      <thead>
        <tr>
          <th>
            Action
          </th>
          <th>
            Target
          </th>
          <th>
            Performed on
          </th>
        </tr>
      </thead>
    );
  }

  render() {
    const actions = this.props.userActions;

    if (!actions || !actions.length) {
      return null;
    }

    return (
      <table>
        <caption>Action Log</caption>
        {this.renderTableHead()}
        <tbody>
          {actions.map(this.renderRow)}
        </tbody>
      </table>
    );
  }
}

UserActionsTable.propTypes = propTypes;
UserActionsTable.defaultProps = {
  userActions: [],
};

const mapStateToProps = state => ({
  userActions: state.userActions.data,
});

export { UserActionsTable };
export default connect(mapStateToProps)(UserActionsTable);
