import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css'
import {db} from './firebase'
import { getDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Button from "react-bootstrap/Button"
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from "react-bootstrap/Card"
import "bootstrap/dist/css/bootstrap.min.css"
import logo from './logo.PNG'

const Navbar = () => {

	
	const auth = getAuth();

    const [user, setUser] = useState({
        name: "",
        uid: "",
    })
	const [status, setStatus] = useState({
        status: "signed out"
    })

	

	useEffect(()=>{
        onAuthStateChanged(auth, (user) => {
            if (user) {
              setUser({
				name: user.name,
				uid: user.uid
			  })
              setStatus({
                status: "signed in"
              });
              // ...
            } else {
              setUser({
				name: "",
				uid: ""
			  })
              setStatus({
                status: "signed out"
              });
            }
          });
    }, [])

	function logOut() {
		signOut(auth);
		navigate("/signin");
	}

	const navigate = useNavigate();
 	function handleClick(path) {
    	navigate(path);
 	}

	if(user.uid == "") {
		console.log("Blank uid")
		return (
			<Card className="banner">
				<Card.Img variant="top" src={logo} />
				<Card.Title>UCLA Events</Card.Title>
				<ButtonGroup vertical>
					<Button variant="warning" onClick={() => handleClick("post")}>Home</Button>
					<Button variant="primary" onClick={() => handleClick("signin")}>Sign In</Button>
					<Button variant="warning" onClick={() => handleClick("upload")}>Post</Button>
				</ButtonGroup>
			</Card>
		);
	} else {
		console.log(user.uid)
    return (
	    <Card className="banner">
			<Card.Img variant="top" src={logo} />
			<Card.Title>UCLA Events</Card.Title>
			<ButtonGroup vertical>
				<Button variant="warning" onClick={() => handleClick("post")}>Home</Button>
				<Button variant="primary" onClick={() => navigate("/user", { state: { id: user.uid} })}>Your Profile</Button>
				<Button variant="warning" onClick={() => handleClick("upload")}>Post</Button>
			</ButtonGroup>
			<Button variant="outline-primary" onClick={() => logOut()}>Log Out</Button>
		</Card>
    );

	}
}

export default Navbar;
