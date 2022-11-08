import "./App.css";
import {db} from './firebase'
import React, { useState, useEffect } from 'react';
import { collection, doc, addDoc, setDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, setPersistence, browserLocalPersistence, signInWithEmailAndPassword } from "firebase/auth";
//import { useNavigate } from 'react-router-dom';

const Signup = () => {
    // Initialize firebase storage for images
    const storage = getStorage();
    const auth = getAuth();
    //const history = useNavigate();

    const [status, setStatus] = useState({
        status: "signed out"
    })

    const [input, setInput] = useState({
        name: "",
        email: "",
        password: ""
    });

    setPersistence(auth, browserLocalPersistence);

    function addAccount(evt) {
        evt.preventDefault();  
        createUserWithEmailAndPassword(auth, input.email, input.password)
            .then((userCredential) => {
                // Signed in 
                const uid = userCredential.user.uid;
                // ...
                signInWithEmailAndPassword(auth, input.email, input.password).then(() => {
                    setDoc(doc(db, "users", uid), {
                        name: input.name,
                        email: input.email,
                        bio: "",
                        posts: []
                    });
                });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(error)
                // ..
        });
    }

    function handleLogin(evt) {
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
                <h1>Sign up here</h1>
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
                            <button type="submit" className="btn" onClick={addAccount}>Sign up</button>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    )
}

export default Signup
