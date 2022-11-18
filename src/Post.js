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
import "bootstrap/dist/css/bootstrap.min.css"

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
        tags: [],
        likes: 0,
	    tagString: "",
        changed: false
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
			            tagString: post.tagString,
                        poster: user_doc.data().name,
                        location: "TBD",
                        timstamp: "TBD",
                        likes: post.likes,
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
    console.log(posts);
    function handleClick(i) {
        setPost({
            ...posts[i],
            likes: posts[i].likes++,
    
        });
        console.log("HI")
    }
 
    return (
        
        <Container className="output-section">
            <Card className="transition-feature">
                <Card.Text>Navigate to the tentative user page</Card.Text>
                <Button variant="outline-warning" onClick={() => navigate("/user", { state: { id: "AJpPuzeERGPp9nkVhpoWRDBEkFE2"} })}>To User Page</Button>
            </Card>

            {posts?.map((post,i)=>(
            
            <Card className="post">
                <Card className="Likes">
                </Card>
                <Card.Img className="img-container" src={post.image} />
                <Card.Text classname="post-info">
                    
                    <p key={i}>Poster: {posts[i].poster}</p>
                    <p key={i}>Caption: {posts[i].caption}</p>
                    <p key={i}>Tags: {posts[i].tagString}</p>
                    <p key={i}>Likes: {posts[i].likes}<Button variant = "outline" onClick = {() => handleClick(i)}>🔥</Button> </p>

                </Card.Text>
            </Card>

            ))}
         
        </Container>
        
    )

}
 
export default Post
