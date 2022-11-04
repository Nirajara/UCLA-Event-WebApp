import React from "react";
import './App.css';
import Post from './Post';
import Upload from './Upload';
import Navbar from './Navbar';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

// Switch from react-router-dom matches the path in the browser to one of the following 
// and displays the matching component

//Right now the posts feed is the home page

//Navigation bar right now is just a simple list

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="content">
          <Switch>
            <Route exact path="/upload">
              <Upload />
            </Route>
            <Route exact path="/post">
              <Post />
            </Route>
            <Route exact path="/">
              <Post />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;
