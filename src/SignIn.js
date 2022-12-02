import "./App.css";
import {db} from './firebase'
import React, { useState, useEffect } from 'react';
import { collection, doc, addDoc, setDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, setPersistence, browserLocalPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import ListGroup from 'react-bootstrap/ListGroup';
import "bootstrap/dist/css/bootstrap.min.css"

const SignIn = () => {
    // Initialize firebase storage for images
    const storage = getStorage();
    const auth = getAuth();
    const navigate = useNavigate();
    //const history = useNavigate();

    const [imageUpload, setImage] = useState();

    const [status, setStatus] = useState({
        status: "signed out"
    })

    const [input, setInput] = useState({
        name: "",
        email: "",
        password: "",
        bio: ""
    });

    setPersistence(auth, browserLocalPersistence);
    
    function addAccount(evt) {
        let errorState = false;
        // if( (input.email.includes("@g.ucla.edu") || input.email.includes("@ucla.edu")) && (input.password.length > 6) && !(input.email.includes(" ") && !input.password.includes(" ")))
        if(input.email[0] === '@')
        {
        console.log("starts with @")
        errorState = true;
        alert("Make sure email contains a prefix.")
        }
        if(  !(input.email.includes("@g.ucla.edu") || input.email.includes("@ucla.edu"))   )
        {
        errorState = true;
        alert("Make sure you use your UCLA email.")
        }
        if(input.email.includes(" "))
        {
        errorState = true;
        alert("Make sure email contains no white space")
        }
        if(input.password.length <= 6)
        {
        errorState = true;
        alert("Make sure password is at least 7 characters long")
        }
        if(input.password.includes(" "))
        {
        errorState = true;
        alert("Make sure password contains no white space")
        }
        if(typeof input.image === 'undefined')
        {
            console.log("no pfp provided")
            errorState = true;
            alert("Make sure to include a profile picture")
        }
        else if(errorState === false){
        evt.preventDefault();  
        const storageRef = ref(storage, imageUpload.name);
        createUserWithEmailAndPassword(auth, input.email, input.password)
            .then((userCredential) => {
                // Signed in 
                const uid = userCredential.user.uid;
                // ...
                signInWithEmailAndPassword(auth, input.email, input.password).then(() => {
                    uploadBytes(storageRef, imageUpload).then((snapshot) => {
                        getDownloadURL(snapshot.ref).then( url => {
                            setDoc(doc(db, "users", uid), {
                                name: input.name,
                                email: input.email,
                                bio: input.bio,
                                image: url,
                                posts: []
                            });
                        });
                    });
                });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(error)
                // ..
        });
        navigate("/post");
        alert("Succesful Sign up")
    }
    }
   

    function signIn() {
        signInWithEmailAndPassword(auth, input.email, input.password);
        navigate("/post")
    }

    function handleLogin(evt) {
        if (evt.target.name == "image") {
            setImage(evt.target.files[0])
        }
        setInput({
            ...input,
            [evt.target.name]: evt.target.value
        })
    }
    

    useEffect(()=>{
        onAuthStateChanged(auth, (user) => {
            if (user) {
              // User is signed in, see docs for a list of available properties
              // https://firebase.google.com/docs/reference/js/firebase.User
              const uid = user.uid;
              setStatus({
                status: "signed in"
              });
              // ...
            } else {
              // User is signed out
              // ...
              setStatus({
                status: "signed out"
              });
            }
          });
    }, [])

    return (
        <section className="post-form">
            <div className="input-section">
                <form>
                    <div className="inputs">
                        <div className="input-wrapper">
                            <h2 className="input-title">Name</h2>
                            <input type="text" placeholder="Enter name" name="name" value={input.name} onChange={handleLogin}/>
                        </div>
                        <div className="input-wrapper">
                            <h2 className="input-title">Email</h2>
                            <input type="text" placeholder="Enter email" name="email" value={input.email} onChange={handleLogin}/>
                        </div>
                        <div className="input-wrapper">
                            <h2 className="input-title">Password</h2>
                            <input type="text" placeholder="Enter password" name="password" value={input.password} onChange={handleLogin}/>
                        </div>
                        <div className="input-wrapper">
                            <h2 className="input-title">Bio</h2>
                            <input type="text" placeholder="Create Bio" name="bio" value={input.bio} onChange={handleLogin}/>
                        </div>
                        <div className="input-wrapper">
                            <h2 className="input-title">Profile Picture</h2>
                            <input type="file" name="image" accept="image/*" value={input.image} onChange={handleLogin}/>
                        </div>
                        <div className="input-wrapper">
                            <Button class="btn btn-outline-warning mr-1" onClick={addAccount}>Sign Up</Button>
                            <Button class="btn btn-outline-warning" onClick={signIn}>Sign In</Button>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    )
}

export default SignIn
