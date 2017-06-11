import React, { Component } from 'react'
import Peer from 'peerjs'
import './App.css'

class App extends Component {
  state = {
    peerId: undefined,
    localStream: undefined,
    remoteStream: undefined,
    recipientId: '',
  }

  componentDidMount() {
    this.peer = new Peer({ host: 'localhost', secure: true, port: 9000 })
    this.peer.on('open', (peerId) => this.setState({ ...this.state, peerId }))
    this.peer.on('connection', (conn) => this.handleConnection(conn))
    this.peer.on('call', (call) => this.handleCall(call))

    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then((stream) => this.setState({ ...this.state, localStream: stream }))
      .catch((error) => { throw error })
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.localStream) {
       this.refs.localVideo.srcObject = nextState.localStream
    }

    if (nextState.remoteStream) {
       this.refs.remoteVideo.srcObject = nextState.remoteStream
    }
  }

  handleConnection = (conn) => {
    console.log('Incoming connection: ')
    console.log(conn)
  }

  handleCall = (call) => {
    console.log('Incoming call: ')
    console.log(call)
    call.answer(this.state.localStream)

    this.handleStream(call)
  }

  handleStream = (call) => {
    call.on('stream', (stream) => {
      console.log(stream)
      this.setState({ ...this.state, remoteStream: stream })
    });
  }
  
  onCallClick = () => {
    const recipient = this.state.recipientId
    if (recipient) {
      const call = this.peer.call(recipient, this.state.localStream)
      this.handleStream(call)
    }
  }

  onRecipientChange = (evt) => {
    this.setState({ ...this.state, recipientId: evt.target.value })
  }

  render() {
    return (
      <div className="App">
        <div>Your id is: {this.state.peerId || 'connecting, please wait...'}</div>
        <video ref="localVideo" className="video-box" autoPlay muted />
        <video ref="remoteVideo" className="video-box" autoPlay />
        <input type="text" placeholder="recipient id" onChange={this.onRecipientChange} />
        <button disabled={!this.state.localStream} onClick={this.onCallClick}>Call</button>
      </div>
    );
  }
}

export default App
