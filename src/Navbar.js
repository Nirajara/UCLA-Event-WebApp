import React from 'react'
import { useNavigate } from 'react-router-dom';
import './Navbar.css'
import Container from 'react-bootstrap/Container'
import Button from "react-bootstrap/Button"
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from "react-bootstrap/Card"
import "bootstrap/dist/css/bootstrap.min.css"
import logo from './logo.PNG'

const Navbar = () => {
	const navigate = useNavigate();
 	function handleClick(path) {
    	navigate(path);
 	}

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
}

export default Navbar;
