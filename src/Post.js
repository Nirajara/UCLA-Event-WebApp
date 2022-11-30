import "./App.css";
import {db} from './firebase'
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom';
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import ListGroup from 'react-bootstrap/ListGroup';
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

const Post = () => {
    // Initialize firebase storage for images
    const storage = getStorage();
    const auth = getAuth();
    const location = useLocation();

    // Initializing state variables to store image and other post data
    const [userData, setUserData] = useState({
        name: "",
        uid: "",
        posts: []
    });

    const [state, setState] = useState({
        user: ""
    })
    const [imageUpload, setImage] = useState();
    const [post, setPost] = useState({
        id: "",
        caption: "",
        tags: [],
        likes: [],
	    tagString: "",
        location: "" 
    });
    const [posts, setPosts] = useState([]);
    const [selected_posts, setSelectedPosts] = useState([]);

    // addPost takes in the image state data and the submitted tags/captions and uploads all the data to firebase
    const addPost = async (e) => {
        e.preventDefault();  
        try {
            const storageRef = ref(storage, imageUpload.name);
            await uploadBytes(storageRef, imageUpload).then((snapshot) => {
                getDownloadURL(snapshot.ref).then( url => {
                    addDoc(collection(db, "posts"), {
                        image: url,
                        caption: post.caption,
                        tags: post.tags,
			            tagString: post.tagString,
                        poster: userData.name,
                        location: post.location,
                        timestamp: post.timestamp,
                        likes: post.likes,
                        comments: []
                    }).then(docRef => {
                        const posts = userData.posts;
                        posts.push(docRef.id)
                        updateDoc(doc(db, "users", userData.uid), {
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
                setSelectedPosts(newData);
            })
            console.log(selected_posts); 
    }
    // This is triggered upon re-rendering
    useEffect(()=>{
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("SUCCESS");
                getDoc(doc(db, "users", user.uid)).then(user_doc => {
                    const data = user_doc.data();
                    setUserData({
                        uid: user.uid,
                        name: data.name,
                        posts: data.posts
                    });
                });
            } 
            /*else {
                navigate('/SignIn');
            }
            */
        });
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

    const navigate = useNavigate();
    
    
    function handleClick(i) {
        if (userData.uid != "") {
        const likes = posts[i].likes;
        console.log(likes);
        if (!likes.includes(userData.uid)) {
            likes.push(userData.uid)
        }
        updateDoc(doc(db, "posts", posts[i].id), {
            likes: likes
        });
        setPost({
            ...posts[i],
            likes: likes,
    
        });

        console.log("HI")
        } else {
            console.log("Gotta sign in first bud")
        }
    }

function selectPosts(tag) 
{
    if(tag === "club")
    {
        console.log("here");
        setSelectedPosts(posts.filter(post => post.tagString.includes("club")));
        console.log(selected_posts);
    }
    else if(tag === "gathering")
    {
        setSelectedPosts(posts.filter(post => post.tagString.includes("gathering")));
    }
    else if(tag === "alert")
    {
        setSelectedPosts(posts.filter(post => post.tagString.includes("alert")));
    }
    else
    {
        setSelectedPosts(posts);
    }

}
    function handleNav(path) {
       navigate(path);
    }

    
    if(userData.uid == "") {
        return (
            <Container className="output-section">
                <Card className="transition-feature">
                    <Button variant="warning" onClick={() => handleNav("/signin")}>Click here to sign in</Button>    
                </Card>

                {selected_posts?.map((post,i)=>(
            
            <Card className="post">
                <Button variant = "outline-warning" onClick = {() => handleClick(i)}>Like</Button> 
                <Card.Img className="img-container" src={post.image} />
                <Card.Text classname="post-info">
                    
                    <p key={i} onClick={() => navigate("/user", { state: { id: posts[i].posterID} })}>Poster: {posts[i].poster}</p>
                    <p key={i}>Caption: {posts[i].caption}</p>
                    <p key={i}>Tags: {posts[i].tagString}</p>
                    <p key={i}>Likes: {posts[i].likes.length}</p>
                    <p key={i}>Location: {posts[i].location}</p>

                </Card.Text>
            </Card>

            ))}
            </Container>
        )
    } else {
 
    return (
        
        <Container className="output-section">
            <Card className="transition-feature">
                <Card.Text>Welcome back, {userData.name}!</Card.Text>
                <DropdownButton id="collasible-nav-dropdown" title="Filter by:">
                    <Dropdown.Item onClick = {() => selectPosts("All")}>All</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPosts("club")}>Club</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPosts("gathering")}>Gathering</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPosts("alert")}>Alert</Dropdown.Item>
                </DropdownButton>
            </Card>

            {selected_posts?.map((post,i)=>(
            
            <Card className="post">
                <Button variant = "outline-warning" onClick = {() => handleClick(i)}>Like</Button> 
                <Card.Img className="img-container" src={post.image} />
                <Card.Text classname="post-info">
                    
                    <p key={i} onClick={() => navigate("/user", { state: { id: posts[i].posterID} })}>Poster: {posts[i].poster}</p>
                    <p key={i}>Caption: {posts[i].caption}</p>
                    <p key={i}>Tags: {posts[i].tagString}</p>
                    <p key={i}>Location: {selected_posts[i].location}</p>
                    <p key={i}>Posted on: {posts[i].timestamp}</p>
                    <p key={i}>Likes: {posts[i].likes.length}</p>

                </Card.Text>
            </Card>

            ))}
         
        </Container>
        
    )
    }

}
 
export default Post
