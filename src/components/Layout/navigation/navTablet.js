
import styles from './navTablet.module.scss'

import Link from "next/link"
import Image from 'next/image';
import { auth } from '@/utils/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { usePathname } from 'next/navigation'
import { useContext, useState } from 'react';

import { ThemeContext } from '@/utils/ContextandProviders/Contexts';
import Button from '@/components/Button/button';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faHouse, faUser, faFolder, faRightFromBracket, faGear, faPenToSquare, faCaretRight, faCaretLeft } from "@fortawesome/free-solid-svg-icons";





const TabletNav = () => {
  const [user, loading] = useAuthState(auth);
  const currentPath = usePathname()
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [collapsed, setCollapsed] = useState(true);
  const logo = theme === 'light' ? "/assets/logo/logo-dark.svg" : "/assets/logo/logo-light.svg"

  //pages route
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
      name: "Archive",
      icon: <FontAwesomeIcon icon={faFolder} />
    },
    {
      path: "/profile",
      name: "Profile",
      icon: <FontAwesomeIcon icon={faUser} />
    },
  ];



  const logOut = () =>{
    toast.success("Succesfully signed out", {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3500,
  });
    auth.signOut()
  }




  return (
    <aside className={styles.tabletNav}>
      <Image
        priority
        src={logo}
        alt="Architecture Nigeria Logo"
        width={190}
        height={135}
      />
      <div className={styles.allLinks}>
        <div className={styles.navlinks}>
          {
            pages.map(link => (
              <Link
                href={link.path}
                key={link.path}
                className={currentPath === link.path ? `${styles.navlink} ${styles.active}` : styles.navlink} >
                {link.icon} {link.name}
              </Link>
            ))
          }
        </div>
        <div className={styles.settings}>
          <Button name={'Make Post'} link={"/post"} type={"primary"} />
          {user && <span className={styles.settingslink}> <FontAwesomeIcon icon={faRightFromBracket} /> Logout</span>}
          <span onClick={logOut} className={styles.settingslink}> <FontAwesomeIcon icon={faGear} /> Settings</span>
        </div>
      </div>
    </aside>
  )
}

export default TabletNav