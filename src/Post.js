import "./App.css";
import Comment from './Comment';
import {db} from './firebase'
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom';
import Button from "react-bootstrap/Button";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
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
	    comments: [],
	    tagString: "",
        location: "",
        timestamp: ""  
    });
    const [posts, setPosts] = useState([]);
    const [selected_tag, set_selected_tag] = useState({
        tag: "",
    });
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
                setSelectedPosts(newData);
            })
    console.log(selected_posts)
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

    function incrementLike(i) {
        if (userData.uid !== "") {
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
	}

    const If = ({condition, children}) => {
        if (condition) {
            return children;
        }
    };


    function addComment(i) {
	var comments = posts[i].comments;
	if (document.getElementById("comment-"+i).value !== "") {
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
	}
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

    function displayCommentsInit(i) {
	var comments = posts[i].comments;
	var list = [];
	comments.forEach((item)=>{
	    let li = (<li className="comment">{item}</li>);
	    list.push(li);
	});
	return (<ul className="comment-display">{list}</ul>);
    }
   

    function getCommentId(i) {
	return "comment-" + i;
    }

    function getCommentDisplayId(i) {
	return "comment-display-" + i;
    }

// function selectPosts(tag) 
// {
//     set_selected_tag({
//         tag: tag
//     })
// }
    
// function selectPosts(tag) 
// {
//     if(tag === "Jan" || tag === "Feb" || tag === "Mar" || tag === "Apr" || tag === "Jun" || tag === "Jul" || tag === "Aug" || tag === "Sep" || tag === "Oct" || tag === "Nov" || tag === "Dec")
//     {
//         console.log("in Jan")
//         set_selected_month({
//             time: tag
//         })
//         console.log(selected_month.time)
//     }
//     else
//     {
//     console.log("in alert")
//     set_selected_tag({
//         tag: tag 
//     })
//     console.log(selected_tag.tag)
// }
// }

function selectPostsAbhi(tag) 
{
    if(tag === "club" || tag === "gathering" || tag === "alert"){setSelectedPosts(posts.filter(post => post.tagString.includes(tag)));}
    else if(tag === "Jan" || tag === "Feb" || tag === "Mar" || tag === "Apr" || tag === "May" || tag === "Jun" || tag === "Jul" || tag === "Aug" || tag === "Sep" || tag === "Oct" || tag === "Nov" || tag === "Dec"){setSelectedPosts(posts.filter(post => post.timestamp.includes(tag)));}
    else if(tag === "0"){setSelectedPosts(posts.filter(post => post.likes.length === 0));}
    else if(tag === "Range: 1-5"){setSelectedPosts(posts.filter(post => (post.likes.length > 0) && (post.likes.length < 6)));} 
    else if(tag === "Range: 6-10"){setSelectedPosts(posts.filter(post => (post.likes.length > 6) && (post.likes.length < 11)));}
    else if(tag === "Range: 11-15"){setSelectedPosts(posts.filter(post => (post.likes.length > 11) && (post.likes.length < 16)));}
    else if(tag === "Range: 16-20"){setSelectedPosts(posts.filter(post => (post.likes.length > 16) && (post.likes.length < 21)));} 
    else if(tag === "Range: 21-35"){setSelectedPosts(posts.filter(post => (post.likes.length > 21) && (post.likes.length < 36)));}
    else{setSelectedPosts(posts)}

}

function handleNav(path) {
       navigate(path);
    }

    
    if(userData.uid === "") {
        return (
            <Container className="output-section">
                <MDBCard className="transition-feature">
                    <Button variant="warning" onClick={() => handleNav("/signin")}>Click here to sign in</Button>    
                </MDBCard>

                {posts?.map((post,i)=>(
                    <MDBCard className="post">
		    <MDBRow className='g-0'>
		    <MDBCol md="6">
		        <MDBCardTitle key={i}>{posts[i].caption} </MDBCardTitle>
		        <MDBCardImage className="img-container" src={post.image} fluid/>
		    <MDBCardText classname="post-info">
		        <p key={i} onClick={() => navigate("/user", { state: { id: posts[i].posterID} })}>Poster: {posts[i].poster}</p>
		        <p key={i}>Caption: {posts[i].caption}</p>
		        <MDBRow className='g-0'>
		        <MDBCol md="6">
		            <p key={i}>Tags: {posts[i].tagString}</p>
		            <p key={i}>Posted on: {posts[i].timestamp}</p>
		        </MDBCol>
		        <MDBCol md="6">
		            <p key={i}>Location: {posts[i].location}</p>
		            <p key={i}>Likes: {posts[i].likes.length}</p>
		        </MDBCol>
		        </MDBRow> 
                        </MDBCardText>
		        <Button variant = "outline-warning" onClick = {() => incrementLike(i)}>Like</Button>
		    </MDBCol>
		    <MDBCol md="6">
		         <MDBCardText classname="post-info">
  		         <MDBCardBody className="comment-section">{displayCommentsInit(i)}</MDBCardBody>
             	         <input type="text" id={getCommentId(i)} placeholder="Say something nice!" name="commentInput"/>
 		         <Button variant="outline-warning" onClick = {() => addComment(i)}>Comment</Button>
		    </MDBCardText>
		    </MDBCol>
		    </MDBRow>
                </MDBCard>
            ))}
            </Container>
        )
    } else {
        
 
    return (
        
        <Container className="output-section">
            <MDBCard className="transition-feature">
                <MDBCardText>Welcome back, {userData.name}!</MDBCardText>
                <ButtonGroup aria-label="Basic example" id = "Basic">
                <DropdownButton id="collasible-nav-dropdown" title="Filter by Tags:">
                    <Dropdown.Item onClick = {() => selectPostsAbhi("")}>All</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("club")}>Club</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("gathering")}>Gathering</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("alert")}>Alert</Dropdown.Item>
                </DropdownButton>

                <DropdownButton id="collasible-nav-dropdown" title="Filter by Months:">
                    <Dropdown.Item onClick = {() => selectPostsAbhi("All")}>All</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("Jan")}>January</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("Feb")}>February</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("Mar")}>March</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("Apr")}>April</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("May")}>May</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("Jun")}>June</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("Jul")}>July</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("Aug")}>August</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("Sep")}>September</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("Oct")}>October</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("Nov")}>November</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("Dec")}>December</Dropdown.Item>
                </DropdownButton>

                <DropdownButton id="collasible-nav-dropdown" title="Filter by Likes:">
                    <Dropdown.Item onClick = {() => selectPostsAbhi("")}>All</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("0")}>None</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("Range: 1-5")}>Range: 1-5</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("Range: 6-10")}>Range: 6-10</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("Range: 11-15")}>Range: 11-15</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("Range: 16-20")}>Range: 16-20</Dropdown.Item>
                    <Dropdown.Item onClick = {() => selectPostsAbhi("Range: 21-35")}>Range: 21-35</Dropdown.Item>
                </DropdownButton>
                </ButtonGroup>
            </MDBCard>

	    <br/>
	
            {selected_posts?.map((post,i)=>(
            
            // <If condition={posts[i].timestamp.includes(selected_month.time) || selected_month.time === ""}>
                    <MDBCard className="post">
		    <MDBRow className='g-0'>
		    <MDBCol md="6">
		        <MDBCardTitle key={i}>{selected_posts[i].caption} </MDBCardTitle>
		        <MDBCardImage className="img-container" src={selected_posts[i].image} fluid/>
		    <MDBCardText classname="post-info">
		        <p key={i} onClick={() => navigate("/user", { state: { id: selected_posts[i].posterID} })}>Poster: {selected_posts[i].poster}</p>
		        <MDBRow className='g-0'>
		        <MDBCol md="6">
		            <p className="post-attribute" key={i}>{selected_posts[i].tagString}</p>
		            <p className="post-attribute" key={i}>{selected_posts[i].timestamp}</p>
		        </MDBCol>
		        <MDBCol md="6">
		            <p className="post-attribute" key={i}>{selected_posts[i].location}</p>
		            <p className="post-attribute" key={i}>{selected_posts[i].likes.length} likes</p>
		        </MDBCol>
                <Button className="like-button" variant = "outline-warning" onClick = {() => incrementLike(i)}>Like</Button>
		        </MDBRow> 
                </MDBCardText>
		    </MDBCol>
		    <MDBCol md="6">
		         <MDBCardText classname="comments">
  		         <MDBCardBody className="comment-section">{displayCommentsInit(i)}</MDBCardBody>
             	        <input className="text-input-box" type="text" id={getCommentId(i)} placeholder="Say something nice!" name="commentInput"/>
 		                <Button className="comment-button" variant="outline-warning" onClick = {() => addComment(i)}>Comment</Button>
		    </MDBCardText>
		    </MDBCol>
		    </MDBRow>
                </MDBCard>
            /* </If> */
            
            ))}
        
        </Container>

	
    )
    }
}

export default Post
