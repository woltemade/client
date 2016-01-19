/* @flow */
/*
 * The main renderer. Holds the global store. When it changes we send it to the main thread which then sends it out to subscribers
 */

import React, {Component} from '../../react-native/react/base-react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import configureStore from '../../react-native/react/store/configure-store'
import Nav from '../../react-native/react/nav'
import injectTapEventPlugin from 'react-tap-event-plugin'
import ListenLogUi from '../../react-native/react/native/listen-log-ui'
import {reduxDevToolsEnable} from '../../react-native/react/local-debug'
import {listenForNotifications} from '../../react-native/react/actions/notifications'

// For Remote Components
import {ipcRenderer} from 'electron'
import RemoteManager from '../../react-native/react/native/remote-manager'
import consoleHelper from '../app/console-helper'
import _ from 'lodash'

consoleHelper()

if (module.hot) {
  module.hot.accept()
}

const store = configureStore()

class Keybase extends Component {
  constructor () {
    super()

    this.state = {
      panelShowing: false
    }

    if (__DEV__) { // eslint-disable-line no-undef
      if (typeof window !== 'undefined') {
        window.addEventListener('keydown', event => {
          if (event.ctrlKey && event.keyCode === 72) {
            this.setState({panelShowing: !this.state.panelShowing})
          }
        })
      }
    }

    // Used by material-ui widgets.
    injectTapEventPlugin()

    this.setupDispatchAction()
    this.setupStoreSubscriptions()

    // Handle notifications from the service
    store.dispatch(listenForNotifications())

    // Handle logUi.log
    ListenLogUi()
  }

  setupDispatchAction () {
    ipcRenderer.on('dispatchAction', (event, action) => {
      // we MUST convert this else we'll run into issues with redux. See https://github.com/rackt/redux/issues/830
      // This is because this is touched due to the remote proxying. We get a __proto__ which causes the _.isPlainObject check to fail. We use
      // _.merge() to get a plain object back out which we can send
      setImmediate(() => {
        try {
          store.dispatch(_.merge({}, action))
        } catch (_) {
        }
      })
    })
  }

  setupStoreSubscriptions () {
    store.subscribe(() => {
      ipcRenderer.send('stateChange', store.getState())
    })
  }

  render () {
    let dt = null
    if (__DEV__ && reduxDevToolsEnable) { // eslint-disable-line no-undef
      const DevTools = require('./redux-dev-tools')
      dt = <DevTools />
    }

    return (
      <Provider store={store}>
        <div style={{display: 'flex', flex: 1}}>
          <RemoteManager />
          <Nav />
          {dt}
        </div>
      </Provider>
    )
  }
}

ReactDOM.render(<Keybase/>, document.getElementById('app'))
