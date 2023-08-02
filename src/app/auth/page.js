"use client"
import styles from "./auth.module.scss"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { auth, db } from "@/utils/firebase";
import { getDoc, doc, setDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import Button from "@/components/Button/button";
import { LoginForm, SignupForm } from "@/components/AuthForms/Login/SignUp";
import WhoseandWhichpost from "@/components/Posts/ShowingPosts/Whosepost/whosepost";
import { faG } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export default function Login() {
  const route = useRouter();
  const [user, loading] = useAuthState(auth);
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
          route.push('/')
        } else {
          route.push('/auth/complete-profile')
        }
      }
    } catch (error) {
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





  return (
    <div className={`content-container ${styles.authpage}`}>
      <section>
      </section>

      <section className={styles.auth}>
        <header>
          <h1>{currentType=== 'Sign up'? "Join" : "Login"} <em>Archi NG</em></h1>
          <h5></h5>
          <WhoseandWhichpost variations={whichAuthType} currentwhosePost={currentType} setCurrentWhosePost={setCurrentType} />
        </header>


        <div className={styles.form}>
          <section>
    
            {currentType === 'Login' && <LoginForm />}
            {currentType === 'Sign up' && <SignupForm />}
          </section>

          <section className={styles.google}>
            <h4>Continue with Google</h4>
            <span className={styles.googlebutton}><Button name='Sign in' type='tertiary' icon={ <FontAwesomeIcon icon={faG} />} link={GoogleLogin} /></span>
          </section>
        </div>

      </section>

    </div>
  );
}