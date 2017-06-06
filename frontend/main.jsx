/* global document:true */

import 'babel-polyfill';
import { render } from 'react-dom';
import React from 'react';
import { Router, browserHistory } from 'react-router';

import siteActions from './actions/siteActions';
import userActions from './actions/userActions';

import routes from './routes';
import store from './store';
import Provider from './util/provider';

require('./sass/styles.scss');

const mainEl = document.querySelector('#js-app');

store.subscribe(() => {
  render((
    <Provider state={{ get: store.getState }}>
      <Router history={browserHistory}>
        {routes}
      </Router>
    </Provider>
  ), mainEl);
});

userActions.fetchUser();
siteActions.fetchSites();
