"use client"

import styles from './navMobile.module.scss'

import Link from "next/link"
import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faHouse, faUser, faFolder, faRightFromBracket, faGear, faPenToSquare } from "@fortawesome/free-solid-svg-icons";


const MobileNav = () => {

  const currentPath = usePathname()
  const wrapperRef = useRef()

  const pages = [
    {
      path: "/",
      name: "Home",
      icon: <FontAwesomeIcon icon={faHouse} />
    },
    {
      path: "/search",
      name: "Search",
      icon: <FontAwesomeIcon icon={faMagnifyingGlass} />
    },
    {
      path: "/archive",
      name: "Archived",
      icon: <FontAwesomeIcon icon={faFolder} />
    },
    {
      path: "/profile",
      name: "Profile",
      icon: <FontAwesomeIcon icon={faUser} />
    },
  ];



  // show and hide navbar based on scroll
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const classes = hidden === true ? `${styles.hidden} ${styles.mobileNav}` : `${styles.mobileNav}`



  useEffect(() => {

    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY) {
          setHidden(true);
        } else if (window.scrollY < lastScrollY) {
          setHidden(false);
        } else if (window.scrollY = 0) { setHidden(true); }

        // remember current page location to use in the next move
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);

      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setHidden((hidden) => !hidden);
      }
    };
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [hidden]);




  return (
    <nav className={classes} ref={wrapperRef}>
      {
        pages.map((link, index) => (
          <Link
            href={link.path} key={index}
            className={currentPath === link.path ? `${styles.navlink} ${styles.active}` : styles.navlink} >
            {link.icon}
          </Link>
        ))
      }

    </nav>
  )
}

export default MobileNav