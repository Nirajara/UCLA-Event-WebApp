import "./App.css";
import Comment from './Comment';
import {db} from './firebase'
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom';
import Button from "react-bootstrap/Button";
import {
    MDBCard,
    MDBCardTitle,
    MDBCardText,
    MDBCardBody,
    MDBCardImage,
    MDBRow,
    MDBCol,
    MDBCardFooter
} from 'mdb-react-ui-kit';
import Container from "react-bootstrap/Container";
import ListGroup from 'react-bootstrap/ListGroup';
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation } from 'react-router-dom';

const Post = () => {
    // Initialize firebase storage for images
    const storage = getStorage();
    const auth = getAuth();
    const location = useLocation();
    
    // Initializing state variables to store image and other post data
    const [userData, setUserData] = useState({
        name: "",
        uid: ""
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
	comments: [],
	tagString: "",
        changed: false
    });
    const [posts, setPosts] = useState([]);

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
                        location: "TBD",
                        timstamp: "TBD",
                        likes: post.likes,
                        comments: post.comments
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
            });
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
		    tagString: tagsToString(tags),
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
		    tagString: tagsToString(tags),
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
    
    function incrementLike(i) {
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
    }

    function addComment(i, inputID) {
	var comments = posts[i].comments;
	if (comments == null || typeof comments != "object") {
	    comments = [document.getElementById("comment-"+i).value];
	} else {
	    comments.push(document.getElementById("comment-"+i).value);
	}
	updateDoc(doc(db, "posts", posts[i].id), {
	    comments: comments
	});
	setPost({
	    ...posts[i],
	    comments: comments
	});
	displayComments(i);
    }

    function displayComments(i) {
	var comments = posts[i].comments;
	let list = document.getElementById("comment-display-"+i);
	list.replaceChildren();
	comments.forEach((item)=>{
	    let li = document.createElement("li");
	    li.innerText = item;
	    li.className = "comment";
	    list.appendChild(li);
	});
    }

    function getCommentId(i) {
	return "comment-" + i;
    }

    function getCommentDisplayId(i) {
	return "comment-display-" + i;
    }

    return (
        <Container className="output-section">
            <MDBCard className="transition-feature">
            <MDBCardText>Welcome back, {userData.name} {setPosts}!</MDBCardText>
            </MDBCard>

	    <br/>
	
            {posts?.map((post,i)=>(

            <MDBCard className="post">
   		<MDBRow className='g-0'>
		    <MDBCol md="6">
        	         <MDBCardTitle key={i}>{posts[i].caption}</MDBCardTitle>
                         <MDBCardImage className="img-container" src={post.image} fluid />
                         <MDBCardText classname="post-info">
              	             <p key={i} onClick={() => navigate("/user", { state: { id: posts[i].posterID} })}>{posts[i].poster}</p>
    		             <p key={i}>Tags: {posts[i].tagString}</p>
       		             <Button variant = "outline-warning" onClick = {() => incrementLike(i)}>Like {posts[i].likes}</Button>
                         </MDBCardText>
                    </MDBCol>
		    <MDBCol md="6">
		        <MDBCardText classname="post-info">
  		            <MDBCardBody className="comment-section">
               	                <ul className="comment-display" id={getCommentDisplayId(i)}></ul>
     		            </MDBCardBody>
             	            <input type="text" id={getCommentId(i)} placeholder="Say something nice!" name="commentInput"/>
 		            <Button variant="outline-warning" onClick = {() => addComment(i, 'commentInput')}>Comment</Button>
		        </MDBCardText>		
		    </MDBCol>
		</MDBRow>
            </MDBCard>

            ))}

	<script type="text/javascript" src="Post.js" async>
	    displayComments(i);
	</script>

        </Container>

	
    )
	/*TODO: Get comments to display when website is loaded instead of after hitting the comment button*/
    

}
 
export default Post
