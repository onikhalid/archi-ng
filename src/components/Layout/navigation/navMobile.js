"use client"

import styles from './navMobile.module.scss'

import Link from "next/link"
import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef, useContext } from 'react';

import { MobileNavContext } from '@/utils/ContextandProviders/Contexts';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faHouse, faUser, faFolder, faRightFromBracket, faGear, faPenToSquare, faFaceSmile, faComments } from "@fortawesome/free-solid-svg-icons";


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
    ,
    {
      path: "/discuss",
      name: "Discuss",
      icon: <FontAwesomeIcon icon={faComments} />
    },
    {
      path: "/archive",
      name: "Archived",
      icon: <FontAwesomeIcon icon={faFolder} />
    }
  ];



  // show and hide navbar based on scroll
  const { hidden, toggleHidden } = useContext(MobileNavContext);
  const classes = hidden === true ? `${styles.hidden} ${styles.mobileNav}` : `${styles.mobileNav}`




  useEffect(() => {


    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        if (!hidden) {
          toggleHidden(true);
        }
      }
    };
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [hidden, toggleHidden]);


  useEffect(() => {

    if (currentPath.includes('discuss/')) {
      toggleHidden(true);
    }
    
   
    return () => {

    };
  }, [currentPath]);
  
  





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