"use client"
import styles from "./body.module.scss"
import "react-toastify/dist/ReactToastify.css";
import { useContext, useState, useEffect, Suspense } from 'react';
import { MobileNavContext, ThemeContext } from '@/utils/ContextandProviders/Contexts';
import AppBar from '@/components/Layout/appbar/appbar'
import Navigation from '@/components/Layout/navigation/nav'
import Button from "@/components/Button/button";
import { ToastContainer } from 'react-toastify';
import { ProgressBar } from "@/components/Layout/navigation/progressbar"
import { useWindowWidth } from "@/utils/Hooks/ResponsiveHook";


const Body = ({ children }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { hidden, toggleHidden } = useContext(MobileNavContext);
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const width = useWindowWidth()


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
      const shouldShowButton = window.scrollY > 600
      setIsVisible(shouldShowButton);


      if ((window.scrollY > lastScrollY) && window.scrollY > 1600) {
        setIsVisible(true);
      } else if (window.scrollY < lastScrollY) {
        setIsVisible(false);
      } else if (window.scrollY == 0) {
        setIsVisible(false);
      }

      if (window.scrollY == 0) {
        toggleHidden(false)
      } 
      else if (window.scrollY < lastScrollY) {
        toggleHidden(false)
      } else {
        toggleHidden(true)
      }



      setLastScrollY(window.scrollY);

    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, width, hidden]);

  const scrollToTop = () => {
    document.body.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" })
  };




  return (
    <body data-theme={theme} className={styles.body}>
      <ToastContainer limit={3} />
      <ProgressBar />
      <button className={isVisible ? `${styles.topbtn}` : `${styles.topbtn} ${styles.hidden}`} onClick={scrollToTop}>back to top</button>

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