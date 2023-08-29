"use client"

import { ThemeContext, MobileNavContext } from "./Contexts";
import { useState, useEffect, useLayoutEffect} from "react";




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


