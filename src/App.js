import React from "react";
import './App.css';
import Post from './Post';
import Upload from './Upload';
import User from './User';
import Navbar from './Navbar';
import SignIn from './SignIn'
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import Container from 'react-bootstrap/Container'
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import "bootstrap/dist/css/bootstrap.min.css"

// Switch from react-router-dom matches the path in the browser to one of the following 
// and displays the matching component

//Right now the posts feed is the home page

//Navigation bar right now is just a simple list

function App() {
  return (
    <Router>
      <div className="App">
        <Container fluid>

          <Row>
              <Col xs={2} className="fixed-top">
                <Navbar />
              </Col>
            <Col md={{ span:10, offset:4}}>
              <div className="content">
                <Routes>
                  <Route exact path="/SignIn" element={<SignIn />}/>
                  <Route exact path="/Upload" element={<Upload />}/>
                  <Route exact path="/User" element={<User />}/>
                  <Route exact path="/Post" element={<Post />}/>
                  <Route exact path="/" element={<Post />}/>
                </Routes>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </Router>
  );
}


export default App;
