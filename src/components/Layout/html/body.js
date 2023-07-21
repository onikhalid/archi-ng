"use client"
import styles from "./body.module.scss"
import "react-toastify/dist/ReactToastify.css";
import { useContext, useState, useEffect, Suspense } from 'react';
import { ThemeContext } from '@/utils/ContextandProviders/Contexts';
import AppBar from '@/components/Layout/appbar/appbar'
import Navigation from '@/components/Layout/navigation/nav'
import Button from "@/components/Button/button";
import { ToastContainer } from 'react-toastify';
import { ProgressBar } from "@/components/Layout/navigation/progressbar"



const Body = ({ children }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);


  const handleResize = () => {
    const newSidebarWidth = document.querySelector(`.${styles.sidebarandnav}`).clientWidth;
    setSidebarWidth(newSidebarWidth);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);



  useEffect(() => {
    const handleScroll = () => {
      const shouldShowButton = window.scrollY > 200; 
      setIsVisible(shouldShowButton);

      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY) {
          setIsVisible(true);
        } else if (window.scrollY < lastScrollY) {
          setIsVisible(false);
        } else if (window.scrollY = 0) { setIsVisible(true); }

        // remember current page location to use in the next move
        setLastScrollY(window.scrollY);
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };




  return (
    <body data-theme={theme}>
      <ToastContainer limit={3} />
      <ProgressBar />
      {isVisible && <div className={styles.topbtn}><Button name={'top ↑'} type={'tertiary'} link={scrollToTop} /></div>}

      <div className={styles.container}>
        <div className={styles.sidebarandnav} style={{ '--sidebar-width': `${sidebarWidth}px` }}>
          <Navigation />
        </div>
        <div className={styles.content} style={{ '--sidebar-width': `${sidebarWidth}px` }}>
          <AppBar />
          <Suspense fallback={<p>Loading...</p>}>
            {children}
          </Suspense>
        </div>
      </div>
    </body>
  )
}

export default Body