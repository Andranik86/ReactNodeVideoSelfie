import React from 'react'

import {
    CONNECTION_STATUS
} from 'constants.js'

function ConnectionStatus(props) {
    const {
        recordId,
        connectionStatus,
    } = props
    switch (connectionStatus) {
        case CONNECTION_STATUS.CONNECTED:
            return <p id="connectionStatus">Connected, {recordId ? recordId : 'Retrieving record id'}</p>
        case CONNECTION_STATUS.DISCONNECTED:
            return <p id="connectionStatus">Disconnected! {recordId ? `${recordId} ( You can still recorde the video )` : 'Please wait for reconnect to retrieve id'}</p>
        case CONNECTION_STATUS.CONNECTING:
            return <p id="connectionStatus">Connecting... {recordId ? `${recordId} ( You can still recorde the video )` : 'Please wait to connect to get record id'}</p>
        default:
            return <p id="connectionStatus"></p>
    }
}

export default ConnectionStatus