"use client"
import styles from "./body.module.scss"
import "react-toastify/dist/ReactToastify.css";
import { useContext, useState, useEffect, Suspense, useLayoutEffect } from 'react';
import { usePathname } from "next/navigation";
import { useWindowWidth } from "@/utils/Hooks/ResponsiveHook";

import { MobileNavContext, ThemeContext } from '@/utils/ContextandProviders/Contexts';
import AppBar from '@/components/Layout/appbar/appbar'
import Navigation from '@/components/Layout/navigation/nav'
import Button from "@/components/Button/button";
import { ToastContainer } from 'react-toastify';
import { ProgressBar } from "@/components/Layout/navigation/progressbar"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretUp, faCat } from "@fortawesome/free-solid-svg-icons";




const Body = ({ children }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { hidden, toggleHidden } = useContext(MobileNavContext);
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const width = useWindowWidth()
  const currentPath = usePathname()


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



  useLayoutEffect(() => {
    if (!(document.body.scrollHeight > window.innerHeight)  && !(currentPath.includes('discuss/'))) {
      toggleHidden(false)
    }



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

      if ((window.scrollY == 0) && !(currentPath.includes('discuss/'))) {
        toggleHidden(false)
      } else if (window.scrollY == 0 && currentPath.includes('discuss/')) {
        toggleHidden(true)
      }
      else if ((window.scrollY < lastScrollY) && !(currentPath.includes('discuss/'))) {
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
  }, [lastScrollY, width, hidden, toggleHidden]);

  const scrollToTop = () => {
    document.body.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" })
  };









  return (
    <body data-theme={theme} className={styles.body}>
      <ToastContainer limit={3} />
      <ProgressBar />
      <button className={isVisible ? `${styles.topbtn}` : `${styles.topbtn} ${styles.hidden}`} onClick={scrollToTop}><FontAwesomeIcon icon={faCaretUp} /></button>

      <div className={styles.container}>
        <section className={styles.sidebarandnav} style={{ '--sidebar-width': `${sidebarWidth}px` }}>
          <Navigation />
        </section>

        <section className={styles.content} style={{ '--sidebar-width': `${sidebarWidth}px` }}>
          <AppBar />
          <Suspense fallback={<p>Loading...</p>}>
            {children}
          </Suspense>
        </section>
      </div>
    </body>
  )
}

export default Body