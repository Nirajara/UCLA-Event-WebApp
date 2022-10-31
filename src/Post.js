import "./App.css";
import {db} from './firebase'
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from "firebase/firestore";

const Post = () => {
    const [post, setPost] = useState({
        image: "",
        caption: "",
        tags: []
    });
    const [posts, setPosts] = useState([]);
 
    const addPost = async (e) => {
        e.preventDefault();  
        try {
            await addDoc(collection(db, "posts"), {
                image: post.image,
                caption: post.caption,
                tags: post.tags,
                poster: "TBD",
                location: "TBD",
                timstamp: "TBD",
                likes: [],
                comments: []
            });
          } catch (e) {
            console.error("Error adding post: ", e);
          }
    }
 
    const fetchPost = async () => {
        await getDocs(collection(db, "posts"))
            .then((querySnapshot)=>{              
                const newData = querySnapshot.docs.map((doc) => ({...doc.data(), id:doc.id }));
                setPosts(newData);    
                console.log('newData', newData);            
            })
    }
   
    useEffect(()=>{
        fetchPost();
        console.log('fetched');
        console.log(posts)
    }, [])
    
    function handlePost(evt) {
        const value = evt.target.value;
        console.log('post', post)
        if (evt.target.name === 'tags') {
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
        } else {
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
                    </div>
                    <div className="btn-container">
                        <button type="submit" className="btn" onClick={addPost}>Submit post</button>
                    </div>
                </form>
            </div>
            <div className="output-section">
                <h1>All Posts:</h1>
                {posts?.map((post,i)=>(
                <div className="post">
                    <p key={i}>Poster: {post.poster}</p>
                    <p key={i}>Caption: {post.caption}</p>
                    <p key={i}>Tags: {post.tags?.map((tag, i)=>(tag + " "))}</p>
                </div>
            ))}
            </div>
        </section>
    )
}
 
export default Post