"use client"

import { ThemeContext, MobileNavContext, UserContext, ThreadContext } from "./Contexts";
import { useState, useEffect, useLayoutEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";



export const ThemeProvider = ({ children }) => {

  const [theme, setTheme] = useState('light');


  const toggleTheme = () => {
    setTheme((theme) => theme === 'dark' ? 'light' : 'dark');
  };

  useLayoutEffect(() => {
    if (localStorage.getItem("theme") === null) {
      setTheme('light')
    } else {
      const currentTheme = localStorage.getItem('theme');
      setTheme(currentTheme);
    }

  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);

  }, [theme]);


  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};





export const MobileNavProvider = ({ children }) => {

  const [hidden, setHidden] = useState(true);


  const toggleHidden = (x) => {
    setHidden(x);
  };




  return (
    <MobileNavContext.Provider value={{ hidden, toggleHidden }}>
      {children}
    </MobileNavContext.Provider>
  );
};





export const UserProvider = ({ children }) => {
  const [authenticatedUser, loadingauthenticatedUser] = useAuthState(auth);
  const [userData, setUserData] = useState({});


  useLayoutEffect(() => {
    const getUserData = async () => {
      if (!loadingauthenticatedUser) {
        if (authenticatedUser) {
          const userDocRef = doc(db, `users/${authenticatedUser.uid}`)
          onSnapshot(userDocRef, (snapshot) => {
            setUserData(snapshot.data())
          })
        }
        else {
          setUserData(null)
        }
      }
    }

    getUserData()
    return () => { };
  }, [authenticatedUser]);





  return (
    <UserContext.Provider value={{ userData, setUserData, authenticatedUser, loadingauthenticatedUser }}>
      {children}
    </UserContext.Provider>
  );
};





export const ThreadProvider = ({ children }) => {
  const [thread, setThreadId] = useState(null);
  const [threadParent, setThreadParent] = useState(null);

  const setThread = (newThreadId) => {
    setThreadId(newThreadId);
  };



  return (
    <ThreadContext.Provider value={{ thread, setThread, threadParent, setThreadParent }}>
      {children}
    </ThreadContext.Provider>
  );
};
