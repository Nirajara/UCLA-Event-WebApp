import React from "react";
import './App.css';
import Post from './Post';
import Upload from './Upload';
import Navbar from './Navbar';
import SignIn from './SignIn'
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';

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
          <Routes>
            <Route exact path="/SignIn" element={<SignIn />}/>
            <Route exact path="/Upload" element={<Upload />}/>
            <Route exact path="/Post" element={<Post />}/>
            <Route exact path="/" element={<Post />}/>
          </Routes>
        </div>
      </div>
    </Router>
  );
}


export default App;
