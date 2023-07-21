"use client"

import { ThemeContext, SubmitContext } from "./Contexts";
import { useState, useEffect } from "react";

export const ThemeProvider = ({ children }) => {

  const [theme, setTheme] = useState('light');
  

  const toggleTheme = () => {
    setTheme((theme) => theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
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



export const SubmitProvider = ({ children }) => {

  const [submitted, setSubmitted] = useState(false);
  

  const toggleSubmitted = () => {
    setSubmitted((submitted) => !submitted  );
  };



  return (
    <SubmitContext.Provider value={{ submitted, toggleSubmitted }}>
      {children}
    </SubmitContext.Provider>
  );
};