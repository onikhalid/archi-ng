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
      const scrollTop = document.body.scrollTop
      const shouldShowButton = scrollTop > 1500;
      setIsVisible(shouldShowButton);

      if ((scrollTop > lastScrollY) && scrollTop > 1500) {
        setIsVisible(true);
      } else if (scrollTop < lastScrollY) {
        setIsVisible(false);
      } else if (scrollTop == 0) { setIsVisible(true); }

      // remember current page location to use in the next move
      setLastScrollY(scrollTop);
    };
    document.body.addEventListener('scroll', handleScroll);

    return () => {
      document.body.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const scrollToTop = () => {
    document.body.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" })
  };




  return (
    <body data-theme={theme} className={styles.body}>
      <ToastContainer limit={3} />
      <ProgressBar />
      <button className={isVisible ? `${styles.topbtn}` : `${styles.topbtn} ${styles.hidden}`} onClick={scrollToTop}>top ↑</button>

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