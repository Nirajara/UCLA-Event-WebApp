import React from 'react'
import {Link} from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
    return (
		<div class = "banner">
	    	<button class="button"><Link to="/signup" class="text-format">Login</Link></button>
	    	<button class="button"><Link to="/post" class="text-format">All Posts</Link></button>
	    	<button class="button"><Link to="/upload" class="text-format">Upload Post</Link></button>
		</div>
    );
}

export default Navbar;
