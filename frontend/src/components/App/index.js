// import logo from './logo.svg';
import React from 'react'
import './App.css';

// Components
import ConnectionStatus from 'components/ConnectionStatus';
import RecordControls from 'components/RecordControls';

import io from 'socket.io-client'
import {
  SERVER_URL,
  CONNECTION_STATUS,
  RECORDING_STATUS,
  CAPTURE_DEVICE_STATUS,
} from 'constants.js'


class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      connectionStatus: CONNECTION_STATUS.DISCONNECTED,
      gettingRecordId: false,
      recordId: null,
      recordingStatus: RECORDING_STATUS.STOPED,
      captureDeviceConnectionStatus: CAPTURE_DEVICE_STATUS.DISCONNECTED,
    }

    this.handleStopControl = this.handleStopControl.bind(this)
    this.handleStartControl = this.handleStartControl.bind(this)
    this.handleResumeControl = this.handleResumeControl.bind(this)
    this.handlePauseControl = this.handlePauseControl.bind(this)
    this.handleConnectCaptureDevice = this.handleConnectCaptureDevice.bind(this)
    this.connectCaptureDevice = this.connectCaptureDevice.bind(this)

    this.videoRef = React.createRef()
  }
  socket = null
  recorder = null
  mediaStream = null

  componentDidMount() {
    this.socket = io(SERVER_URL)
    this.setState({
      connectionStatus: CONNECTION_STATUS.CONNECTING,
    })
    this.socket.on('connect', e => {
      this.setState((state) => {
        if (state.connectionStatus !== CONNECTION_STATUS.CONNECTING) return state
        return {
          ...state,
          connectionStatus: CONNECTION_STATUS.CONNECTED,
        }
      }, () => {
        console.log(this.state)
        if (this.state.connectionStatus !== CONNECTION_STATUS.CONNECTED) return

        if (!this.state.gettingRecordId && !this.state.recordId) {
          this.socket.emit('get_record_id', (id) => {
            this.setState({
              recordId: id,
            })
          })
        }
      })
    })

    this.socket.on('reconnect_attempt', e => {
      this.setState({
        connectionStatus: CONNECTION_STATUS.CONNECTING,
      })
    })
    this.socket.on('disconnect', e => {
      this.setState({
        connectionStatus: CONNECTION_STATUS.DISCONNECTED,
      })
    })
  }

  async connectCaptureDevice() {
    try {
      if (this.mediaStream) return
      this.setState({
        captureDeviceConnectionStatus: CAPTURE_DEVICE_STATUS.CONNECTING,
      })
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
        },
        audio: false,
      })
      // console.log(this.mediaStream)
      this.setState({
        captureDeviceConnectionStatus: CAPTURE_DEVICE_STATUS.CONNECTED,
      })
    } catch (err) {
      this.setState({
        captureDeviceConnectionStatus: CAPTURE_DEVICE_STATUS.DISCONNECTED,
      })
    }
  }

  handleStartControl() {
    if (this.state.captureDeviceConnectionStatus === CAPTURE_DEVICE_STATUS.DISCONNECTED) return
    if (!this.state.recordId || this.state.recordingStatus !== RECORDING_STATUS.STOPED) return
    this.recorder = new MediaRecorder(this.mediaStream)
    this.recorder.start(2000)

    const currentRecordId = this.state.recordId
    this.recorder.addEventListener('dataavailable', e => {
      const data = e.data
      console.log(`curretRecordId: ${currentRecordId}`)
      console.log(data)
      this.socket.emit(`record_data_${currentRecordId}`, {
        mediaType: data.type,
        data,
      })
    })
    this.setState({
      recordingStatus: RECORDING_STATUS.RECORDING,
    })
  }
  handlePauseControl() {
    if (this.state.captureDeviceConnectionStatus === CAPTURE_DEVICE_STATUS.DISCONNECTED) return
    if (!this.state.recordId || this.state.recordingStatus !== RECORDING_STATUS.RECORDING) return

    this.recorder.pause()
    this.setState({
      recordingStatus: RECORDING_STATUS.PAUSED,
    })
  }
  handleResumeControl() {
    if (this.state.captureDeviceConnectionStatus === CAPTURE_DEVICE_STATUS.DISCONNECTED) return
    if (!this.state.recordId || this.state.recordingStatus !== RECORDING_STATUS.PAUSED) return

    this.recorder.resume()
    this.setState({
      recordingStatus: RECORDING_STATUS.RECORDING,
    })
  }
  handleStopControl() {
    if (this.state.captureDeviceConnectionStatus === CAPTURE_DEVICE_STATUS.DISCONNECTED) return
    if (!this.state.recordId || this.state.recordingStatus === RECORDING_STATUS.STOPED) return
    this.recorder.stop()
    this.socket.emit(`record_data_finish_${this.state.recordId}`)
    this.recorder = null
    this.socket.emit('get_record_id', (id) => {
      this.setState({
        recordId: id,
      })
    })

    this.setState({
      gettingRecordId: true,
      recordId: null,
      recordingStatus: RECORDING_STATUS.STOPED
    })
  }
  handleConnectCaptureDevice() {
    if (this.state.captureDeviceConnectionStatus !== CAPTURE_DEVICE_STATUS.DISCONNECTED) return
    this.connectCaptureDevice()
  }

  render() {
    // console.log(this.state.captureDeviceConnectionStatus)
    if (this.state.captureDeviceConnectionStatus === CAPTURE_DEVICE_STATUS.CONNECTED) {
      // console.log(this.mediaStream)
      this.videoRef.current.srcObject = this.mediaStream
    }

    return (
      <div className="App">
        <p>Video Selfie Test</p>
        <div>
          <div className="stoped" id="indicator"></div>
          <video autoPlay={true} ref={this.videoRef}></video>
          <button
            className={this.state.captureDeviceConnectionStatus !== CAPTURE_DEVICE_STATUS.DISCONNECTED ? 'error' : 'success'}
            onClick={this.handleConnectCaptureDevice}
          >Connect Capture Device</button>
          <div>
            <ConnectionStatus recordId={this.state.recordId} connectionStatus={this.state.connectionStatus} />
            <RecordControls
              recordId={this.state.recordId}
              recordingStatus={this.state.recordingStatus}
              captureDeviceConnected={this.state.captureDeviceConnectionStatus !== CAPTURE_DEVICE_STATUS.DISCONNECTED}

              handleStart={this.handleStartControl}
              handlePause={this.handlePauseControl}
              handleResume={this.handleResumeControl}
              handleStop={this.handleStopControl}
            />
          </div>
        </div>
        <div id="log"></div>
      </div>
    );
  }
}

export default App;
