import "./App.css";
import {db} from './firebase'
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Post = () => {
    // Initialize firebase storage for images
    const storage = getStorage();

    // Initializing state variables to store image and other post data
    const [imageUpload, setImage] = useState();
    const [post, setPost] = useState({
        caption: "",
        tags: []
    });
    const [posts, setPosts] = useState([]);

    // addPost takes in the image state data and the submitted tags/captions and uploads all the data to firebase
    const addPost = async (e) => {
        e.preventDefault();  
        try {
            const storageRef = ref(storage, imageUpload.name);
            await uploadBytes(storageRef, imageUpload).then((snapshot) => {
                getDownloadURL(snapshot.ref).then( url => {
                    console.log('succ')
                    addDoc(collection(db, "posts"), {
                        image: url,
                        caption: post.caption,
                        tags: post.tags,
                        poster: "TBD",
                        location: "TBD",
                        timstamp: "TBD",
                        likes: [],
                        comments: []
                    });
                });
              });
          } catch (e) {
            console.error("Error adding post: ", e);
          }
    }
    
    // fetchPost gathers all posts squentially and stores them in the "posts" state variable
    const fetchPost = async () => {
        await getDocs(collection(db, "posts"))
            .then((querySnapshot)=>{              
                const newData = querySnapshot.docs.map((doc) => ({...doc.data(), id:doc.id }));
                setPosts(newData);             
            })
    }
   
    // This is triggered upon re-rendering
    useEffect(()=>{
        fetchPost();
    }, [])
    
    // Updates post data
    function handlePost(evt) {
        const value = evt.target.value;
        // If we are modifying image input, change the image state variable
        if (evt.target.name === 'image') {
            setImage(evt.target.files[0]);
        } 
        // If we are modifying the tags, we will add or remove them depending on whether the box is being checked
        else if (evt.target.name === 'tags') {
            // The try catch is checking if any tags have been added yet, and if not it creates the list
            try {
                const tags = post.tags;
                if (!tags.includes(value)) {
                    tags.push(value);
                } else {
                    tags.slice(tags.indexOf(value), 1);
                }
                setPost({
                    ...post,
                    tags: tags
                });
            } catch {
                const tags = [];
                if (!tags.includes(value)) {
                    tags.push(value);
                } else {
                    tags.slice(tags.indexOf(value), 1);
                }
                setPost({
                    ...post,
                    tags: tags
                });
            }
        } 
        // Otherwise if we're just modifying the caption we modify the post input data normally
        else {
            setPost({
                ...post,
                [evt.target.name]: value
            });
        }
    }
 
    return (
        <div className="output-section">
            <h1>All Posts</h1>
            {posts?.map((post,i)=>(
            <div className="post">
                <div className="img-container">
                    <img className="post-img" src={post.image}></img>
                </div>
                <div classname="post-info">
                    <p key={i}>Poster: {post.poster}</p>
                    <p key={i}>Caption: {post.caption}</p>
                    <p key={i}>Tags: {post.tags?.map((tag, i)=>(tag + " "))}</p>
                </div>
            </div>
        ))}
        </div>
    )
}
 
export default Post
