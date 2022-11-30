import "./App.css";
import {db} from './firebase'
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, addDoc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, setPersistence, browserLocalPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Button from "react-bootstrap/Button";
import Overlay from 'react-bootstrap/Overlay';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import axios from 'axios';

function Upload() {

    // Initialize firebase storage for images
    const storage = getStorage();
    const auth = getAuth();
    const uid = "";

    // Initializing state variables to store image and other post data
    const [userData, setUserData] = useState({
        name: "",
        uid: "",
        posts: []
    });
    const [imageUpload, setImage] = useState();
    const [post, setPost] = useState({
        caption: "",
        tags: [],
        likes: [],
	    tagString: "",
        location: ""
    });
    const [posts, setPosts] = useState([]);

    const [show, setShow] = useState(false);
    const target = useRef(null);

    const getPosterLocation = () => {
        if (navigator.geolocation) {
          // ADDED FROM HERE 
          navigator.geolocation.getCurrentPosition(position => {
            console.log(position.coords);
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            var config = {
                method: 'get',
                headers: { 
                    'Access-Control-Allow-Origin' : '*',
                    'Access-Control-Allow-Headers': 'Origin',
                    'Access-Control-Allow-Credentials': true
                },
                origin: "*"
              };
              
              axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522%2C151.1957362&radius=1500&type=restaurant&keyword=cruise&key=AIzaSyCNoCckrtCEMDlbupj9XS5K6sG9T7JsJMY', config).then(function (response) {
                console.log(JSON.stringify(response.data));
              })
              .catch(function (error) {
                console.log(error);
              });
          });
          // ADDED UNTIL HERE                                                  
        } else {
          // code for legacy browsers
        }
    };

    // addPost takes in the image state data and the submitted tags/captions and uploads all the data to firebase
    const addPost = async (e) => {
        e.preventDefault();  
        console.log("UID:", userData.uid);
        try {
            const storageRef = ref(storage, imageUpload.name);
            var date = new Date().toString();
            date = date.slice(8, 10) + " " + date.slice(4, 7) + " " + date.slice(11, 16);
            await uploadBytes(storageRef, imageUpload).then((snapshot) => {
                getDownloadURL(snapshot.ref).then( url => {
                    addDoc(collection(db, "posts"), {
                        image: url,
                        caption: post.caption,
                        tags: post.tags,
			            tagString: post.tagString,
                        poster: userData.name,
                        posterID: userData.uid,
                        location: post.location,
                        timestamp: date,
                        likes: post.likes,
                        comments: []
                    }).then(docRef => {
                        const posts = userData.posts;
                        posts.push(docRef.id)
                        updateDoc(doc(db, "users", userData.uid), {
                            posts: posts
                        });
                    });
                });
              });
              setShow(!show);
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
        getPosterLocation();
        onAuthStateChanged(auth, (user) => {
            getDoc(doc(db, "users", user.uid)).then(user_doc => {
                const data = user_doc.data();
                setUserData({
                    uid: user.uid,
                    name: data.name,
                    posts: data.posts
                });
            });
        });    
    }, 
    [])

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

    const navigate = useNavigate();
 	function handleClick(path) {
    	navigate(path);
 	}

    if (userData.uid == "") {
        return (
            <Container className="output-section">
                    <Card className="post" >
                        <Card.Title>You must be signed in to post</Card.Title>
                        <Button variant="warning" onClick={() => handleClick("/signin")}>Sign In</Button>
                    </Card>
            </Container>
        )
    } else {

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
                            <h2 className="input-title">Post Location</h2>
                            <input type="text" placeholder="Enter Location" name="location" value={post.location} onChange={handlePost}/>
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
                            <Button variant="outline-warning" ref={target} onClick={addPost}>Submit post</Button>
                            <Overlay target={target.current} show={show} placement="right">
                                {({ placement, arrowProps, show: _show, popper, ...props }) => (
                                <div
                                    {...props}
                                    style={{
                                    position: 'absolute',
                                    backgroundColor: 'rgba(32, 107, 200, 0.85)',
                                    padding: '2px 10px',
                                    color: 'gold',
                                    borderRadius: 3,
                                    ...props.style,
                                    }}
                                >
                                    Posted Successfully!
                                </div>
                                )}
                            </Overlay>
                        </div>
                    </div>
                </form>
            </div>
    )
}

}

export default Upload
