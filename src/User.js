import "./App.css";
import {db} from './firebase'
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useLocation } from 'react-router-dom';


const User = () => {
    // Initialize firebase storage for images
    const storage = getStorage();
    const auth = getAuth();
    const location = useLocation();

    const [state, setState] = useState({
        name: "",
        bio: "",

    })
    const [posts, setPosts] = useState({
        posts: []
    })

    const fetchUser = async() => {
        getDoc(doc(db, "users", location.state.id)).then(user => {
            const data = user.data();
            setState({
                name: data.name,
                bio: data.bio,
            })
            getDocs(collection(db, "posts")).then((querySnapshot) => {
                querySnapshot.forEach((post) => {
                    if (data.posts.includes(post.id)) {
                        getDoc(doc(db, "posts", post.id)).then(user_post => {
                            const currPosts = posts.posts;
                            currPosts.push(user_post.data())
                            setPosts({
                                posts: currPosts,
                            })
                        })
                    }
                });
            })
        })
    }

  
    // This is triggered upon re-rendering
    useEffect(()=>{
        fetchUser();
    }, [])
    

    return (
    
        <div className="output-section">
            <div className="user-card">
                <p>Name: {state.name}</p>
                <p>Bio: {state.bio}</p>
                <p>Trophies 🏆: {posts.posts.length}</p>
               
            </div>
            
            {posts.posts?.map((post,i)=>(
            <div className="post">
                <div className="img-container">
                    <img className="post-img" src={post.image}></img>
                </div>
                <div classname="post-info">
                    <p key={i}>Poster: {post.poster}</p>
                    <p key={i}>Caption: {post.caption}</p>
                    <p key={i}>Tags: {post.tagString}</p>
                    <p key={i}>Location: {post.location}</p>
                    <p key={i}>Likes: {post.likes.length}</p>
                </div>
            </div>
            ))}
        </div>
    )
}
 
export default User
