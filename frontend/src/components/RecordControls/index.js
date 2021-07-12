import React from 'react'

import {
    RECORDING_STATUS,
} from 'constants.js'

function RecordControls(props) {
    const {
        recordId,
        recordingStatus,
        captureDeviceConnected,

        handleStart,
        handleStop,
        handleResume,
        handlePause,
    } = props
    return <>
        <div id="recordControls">
            <button className={
                !captureDeviceConnected || !recordId || recordingStatus !== RECORDING_STATUS.STOPED ? 'error' : 'success'
            } id="start" disabled={!recordId} onClick={handleStart}>Start Recording</button>
            <button className={
                !captureDeviceConnected || !recordId || recordingStatus !== RECORDING_STATUS.RECORDING ? 'error' : 'success'
            } id="pause" disabled={!recordId} onClick={handlePause}>Pause Recording</button>
            <button className={
                !captureDeviceConnected || !recordId || recordingStatus !== RECORDING_STATUS.PAUSED ? 'error' : 'success'
            } id="resume" disabled={!recordId} onClick={handleResume}>Resume Recording</button>
            <button className={
                !captureDeviceConnected || !recordId || recordingStatus === RECORDING_STATUS.STOPED ? 'error' : 'success'
            } id="stop" disabled={!recordId} onClick={handleStop}>Stop Recording</button>
        </div>
    </>
}

export default RecordControls