import styles from './navDesktop.module.scss'

import Link from "next/link"
import Image from 'next/image';
import { usePathname } from 'next/navigation'
import { useContext } from 'react';
import { ThemeContext } from '@/utils/ContextandProviders/Contexts';
import Button from '@/components/Button/button';
import { auth } from '@/utils/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faHouse, faUser, faFolder, faRightFromBracket, faGear } from "@fortawesome/free-solid-svg-icons";

const DesktopNav = () => {
  const [user, loading] = useAuthState(auth);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const logo = theme === 'light' ? "/assets/logo/logo-dark.svg" : "/assets/logo/logo-light.svg"
  const currentPath = usePathname()

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
    <aside className={styles.desktopNav}>
      <Image
        priority
        src={logo}
        alt="Architecture Nigeria"
        width={180}
        height={105}
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
          <Button title={!user && 'You have to sign in to make posts'} name={"Make Post"} link={"/post"} type={"primary"} />
          {user && <span onClick={logOut} className={styles.settingslink}> <FontAwesomeIcon icon={faRightFromBracket} /> Logout</span>}
          <span className={styles.settingslink}> <FontAwesomeIcon icon={faGear} /> Settings</span>
        </div>
      </div>

    </aside>
  )
}

export default DesktopNav