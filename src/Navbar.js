import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css'
import {db} from './firebase'
import { getDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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

	

	useEffect(()=>{
        onAuthStateChanged(auth, (user) => {
            getDoc(doc(db, "users", user.uid)).then(user_doc => {
                const data = user_doc.data();
                setUser({
                    uid: user.uid,
                    name: data.name,
                });
            });
        });
    });

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
			<Button variant="outline-primary">Log Out</Button>
		</Card>
    );

	}
}

export default Navbar;
