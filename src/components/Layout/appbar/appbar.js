import styles from "./appbar.module.scss"

import Image from "next/image";
import Link from "next/link";
import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '@/utils/ContextandProviders/Contexts';
import { useWindowWidth } from "@/utils/Hooks/ResponsiveHook";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/utils/firebase";
import Button from "@/components/Button/button";
import Menu from "./menu";


const AppBar = () => {
  const [user, loading] = useAuthState(auth);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const width = useWindowWidth();
  const logo = theme === 'light' ? "/assets/logo/logo-dark.svg" : "/assets/logo/logo-light.svg"

  // side menu
  const [menuOpen, setMenuOpen] = useState(null);
  const [menuClass, setMenuClass] = useState(`${styles.menu}`);
  const showmenu = () => {
    if (menuOpen === null) {
      setMenuOpen(true)
      setMenuClass(`${styles.menu} ${styles.menuOpen}`)
    }
    else if (menuOpen === true) {
      setMenuOpen(false)
      setMenuClass(`${styles.menu} ${styles.menuClose}`)
    }
    else if (menuOpen === false) {
      setMenuOpen(true)
      setMenuClass(`${styles.menu} ${styles.menuOpen}`)
    }
  }



  return (
    <header className={styles.appbar}>
      <div className={styles.left}>
        {
          width < 720 &&
          <Link href={'/'} title="go to homepage">
            <Image
              priority
              src={logo}
              alt="Architecture Nigeria Logo"
              width={80}
              height={55}
            />
          </Link>

        }

      </div>
      <div className={styles.right}>
        {/* show menu if user is logged in else show sign in */}
        {
          user ? <Button name={menuOpen ? "Close" : "Menu"} type='secondary' link={showmenu} /> : <Button name='Sign in' type='primary' link='/auth' />
        }
      </div>



      {/* display menu */}
      <Menu menuclass={menuClass} />

    </header>
  )
}

export default AppBar