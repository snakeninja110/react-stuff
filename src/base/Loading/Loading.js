import React, { Component } from 'react';

import './Loading.styl';

export default class Loading extends Component {
  render() {
    return (
      <div style={{color: '#f4696b'}} className="la-ball-newton-cradle">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
  }
}