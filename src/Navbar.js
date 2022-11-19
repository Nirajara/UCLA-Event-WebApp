import React from 'react'
import {Link} from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import './Navbar.css'
import Container from 'react-bootstrap/Container'
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
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
			<Card.Title>Website Name</Card.Title>
			<Card.Subtitle>We should probably come up with a name for the website</Card.Subtitle>
			<ButtonGroup vertical>
				<Button variant="warning" onClick={() => handleClick("post")}>Home</Button>
				<Button variant="primary" onClick={() => handleClick("signin")}>Login</Button>
				<Button variant="warning" onClick={() => handleClick("upload")}>Post</Button>
			</ButtonGroup>
		</Card>
    );
}

export default Navbar;
