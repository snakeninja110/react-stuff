import React, { Component } from 'react';
import List from './components/List/List';
import logo from './logo.svg';
import './App.styl';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
          <h3 className="App-sub-title">just a demo</h3>
        </header>
        <List></List>
      </div>
    );
  }
}

export default App;
