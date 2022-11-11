import "./App.css";
import {db} from './firebase'
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

function Upload() {

    // Initialize firebase storage for images
    const storage = getStorage();

    // Initializing state variables to store image and other post data
    const [imageUpload, setImage] = useState();
    const [post, setPost] = useState({
        caption: "",
        tags: [],
	tagString: ""
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
			tagString: post.tagString,
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

    function tagsToString(tags) {
	var tagString;
	if (tags.length > 0)
	    tagString = tags[0];
	for (let i = 1; i < tags.length; i++) {
	    tagString = tagString + ", " + tags[i];
	}
	return tagString;
    }
    
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
                    tags: tags,
		    tagString: tagsToString(tags)
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
                    tags: tags,
		    tagString: tagsToString(tags)
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
        <div className="Upload">
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
    )
}

export default Upload
