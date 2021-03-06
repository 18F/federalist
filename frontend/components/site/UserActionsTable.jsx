import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { USER_ACTION } from '../../propTypes';
import { timestampUTC } from '../../util/datetime';
import userActions from '../../actions/userActions';

class UserActionsTable extends React.Component {
  componentDidMount() {
    const { fetchUserActions, site } = this.props;
    fetchUserActions(site);
  }

  renderRow(action) {
    return (
      <tr key={`${action.id}-${action.targetType}`}>
        <td>{action.initiator.username}</td>
        <td>{action.actionType.action}</td>
        <td>{action.actionTarget.username}</td>
        <td>{timestampUTC(action.createdAt)}</td>
      </tr>
    );
  }

  renderTableHead() {
    return (
      <thead>
        <tr>
          <th>
            Initiator
          </th>
          <th>
            Action
          </th>
          <th>
            Target
          </th>
          <th>
            Timestamp (UTC)
          </th>
        </tr>
      </thead>
    );
  }

  render() {
    const { userActions: actions } = this.props;

    if (!actions || !actions.length) {
      return null;
    }

    return (
      <table className="table-full-width log-table">
        <caption>Action Log</caption>
        {this.renderTableHead()}
        <tbody>
          {actions.map(this.renderRow)}
        </tbody>
      </table>
    );
  }
}

UserActionsTable.propTypes = {
  fetchUserActions: PropTypes.func.isRequired,
  site: PropTypes.number.isRequired,
  userActions: PropTypes.arrayOf(USER_ACTION),
};

UserActionsTable.defaultProps = {
  userActions: [],
};

const mapStateToProps = state => ({
  userActions: state.userActions.data,
});

const mapDispatchToProps = () => ({
  fetchUserActions: userActions.fetchUserActions,
});

export { UserActionsTable };
export default connect(mapStateToProps, mapDispatchToProps)(UserActionsTable);
