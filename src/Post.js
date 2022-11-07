import "./App.css";
import {db} from './firebase'
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Post = () => {
    // Initialize firebase storage for images
    const storage = getStorage();
    const auth = getAuth();

    // Initializing state variables to store image and other post data
    const [state, setState] = useState({
        user: ""
    })
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
            const user_doc = await getDoc(doc(db, "users", state.user));
            await uploadBytes(storageRef, imageUpload).then((snapshot) => {
                getDownloadURL(snapshot.ref).then( url => {
                    addDoc(collection(db, "posts"), {
                        image: url,
                        caption: post.caption,
                        tags: post.tags,
                        poster: user_doc.data().name,
                        location: "TBD",
                        timstamp: "TBD",
                        likes: [],
                        comments: []
                    }).then(docRef => {
                        const posts = user_doc.data().posts;
                        posts.push(docRef.id)
                        updateDoc(doc(db, "users", state.user), {
                            posts: posts
                        });
                        forceUpdate();
                    });
                });
              });
          } catch (e) {
            console.error("Error adding post: ", e);
          }
    }

    function forceUpdate() {
        window.location.reload(false);
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
        onAuthStateChanged(auth, (user) => {
            if (user) { 
                setState({
                    user: user.uid
                })
            }
        });
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
        <section className="post-form">
            <div className="input-section">
                <h1>Upload Post Here</h1>
                <form>
                    <div className="inputs">
                        <div className="input-wrapper">
                            <h2 className="input-title">Post Image</h2>
                            <input type="file" name="image" accept="image/*" value={post.image} onChange={handlePost}/>
                        </div>
                        <div className="input-wrapper">
                            <h2 className="input-title">Post Caption</h2>
                            <input type="text" placeholder="Enter caption" name="caption" value={post.caption} onChange={handlePost}/>
                        </div>
                        <div className="input-wrapper">
                            <h2 className="input-title">Post Tags</h2>
                            <input type="checkbox" id="club" name="tags" value="club" onChange={handlePost}/>
                            <label for="vehicle1">Club</label>
                            <input type="checkbox" id="gathering" name="tags" value="gathering" onChange={handlePost}/>
                            <label for="vehicle2">Gathering</label>
                            <input type="checkbox" id="alert" name="tags" value="alert" onChange={handlePost}/>
                            <label for="vehicle3">Alert</label>
                        </div>
                        <div className="input-wrapper">
                            <button type="submit" className="btn" onClick={addPost}>Submit post</button>
                        </div>
                    </div>
                </form>
            </div>
            <div className="output-section">
                <h1>All Posts:</h1>
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
        </section>
    )
}
 
export default Post