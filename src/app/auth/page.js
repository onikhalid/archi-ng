"use client"
import styles from "./auth.module.scss"
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { auth, db } from "@/utils/firebase";
import { getDoc, doc, setDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import Button from "@/components/Button/button";
import { LoginForm, SignupForm } from "@/components/AuthForms/Login/SignUp";
import WhoseandWhichpost from "@/components/Posts/ShowingPosts/Whosepost/whosepost";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { toast } from "react-toastify";


export default function Login() {
  const route = useRouter();
  const [user, loading] = useAuthState(auth);
  const param = useSearchParams();
  const query = param.get('redirect')
  const [currentType, setCurrentType] = useState('Login');






  //Sign in with google
  const googleProvider = new GoogleAuthProvider();
  const GoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        const userData = {
          id: user.uid,
          name: user.displayName,
          profilePicture: user.photoURL
        }
        await setDoc(userDocRef, userData)
        route.push("/auth/complete-profile");
      }
      else if (userDocSnap.exists()) {
        const data = userDocSnap.data()
        if (data.hasOwnProperty('username')) {
          // route.push('/')
          route.back()
        } else {
          route.push('/auth/complete-profile')
        }
      }
    } catch (error) {
      if (error.code || error.message === "auth/popup-blocked") {
        toast.error("Your browser blocked a pop-up", {
          position: "top-center",
          autoClose: 3500
        })
      } else {
        
      }
      console.log(error);
    }
  };





  const whichAuthType = [
    {
      number: 1,
      name: "Login",
    },
    {
      number: 2,
      name: "Sign up",
    }
  ];

  const goBack = () => {
    if (query) {
      if (query == "home") {
        route.push('/')
      }
    } else {
      route.back()
    }
  }



  return (
    <div className={`content-container ${styles.authpage}`}>
      <section className={styles.closebutton} onClick={goBack}>
        <FontAwesomeIcon icon={faX} bounce />
      </section>

      <section className={styles.auth}>
        <header>
          <h1>{currentType === 'Sign up' ? "Join" : "Login"} <em>Archi NG</em></h1>
          <WhoseandWhichpost variations={whichAuthType} currentwhosePost={currentType} setCurrentWhosePost={setCurrentType} />
        </header>


        <div className={styles.form}>
          <section>

            {currentType === 'Login' && <LoginForm />}
            {currentType === 'Sign up' && <SignupForm />}
          </section>

          <section className={styles.google}>
            <h5>Continue with Google</h5>
            <span className={styles.googlebutton}><Button name='Sign in' type='septima' icon={<FontAwesomeIcon icon={faGoogle} />} link={GoogleLogin} /></span>
          </section>
        </div>

      </section>

    </div>
  );
}