import React from 'react'
import {Link} from 'react-router-dom'


const Navbar = () => {
    return (  
        <ul>
            <li><Link to="/post">All Posts</Link></li>
            <li><Link to="/upload">Upload a new post</Link></li>
        </ul>
    );
}

export default Navbar;