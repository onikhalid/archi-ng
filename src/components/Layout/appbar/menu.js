"use client"

import styles from "./menu.module.scss"
import { useContext } from 'react';
import { ThemeContext } from '@/utils/ContextandProviders/Contexts';
import { useAuthState } from "react-firebase-hooks/auth";
import { useWindowWidth } from "@/utils/Hooks/ResponsiveHook";
import { auth } from "@/utils/firebase";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopyright, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import Button from "@/components/Button/button";

const Menu = ({ menuclass }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const logo = theme === 'light' ? "/assets/logo/logo-dark.svg" : "/assets/logo/logo-light.svg"
    const [user, loading] = useAuthState(auth);
    const width = useWindowWidth()
    const buildingTypologies = ["Residential", "Commercial", "Institutional", "Industrial", "Religious", "Transportation", "Hospitality", "Educational", "Mixed Use", "Cultural and Recreational", "Civic and Government"];
    const buildingArray = width < 720 ? buildingTypologies.slice(0, 8) : buildingTypologies


    return (
        <div className={menuclass}>
            <div className={styles.container}>
                <section className={styles.menuSettings}>
                    <section>
                        <div className={styles.themeswitch}>
                            Theme
                            <div className={styles.switchsvg}>
                                <input onClick={toggleTheme} type="checkbox" id="switch" /><label htmlFor="switch">th</label>
                            </div>
                        </div>

                        <div className={styles.user}>
                            <h6>{user?.displayName}</h6>
                            {
                                !loading && user &&
                                <Image
                                    src={user.photoURL}
                                    alt={`picture - ${user?.displayName}`}
                                    width={40}
                                    height={40}
                                />
                            }
                        </div>

                    </section>

                    {
                        width < 720 &&
                        <section>
                            <Button name={'Make Post'} link={"/post"} type={"quinta"} />
                            {user && <span className={styles.settingslink}> <FontAwesomeIcon icon={faRightFromBracket} /> Logout</span>}
                        </section>
                    }
                </section>


                <section className={styles.menuContents}>
                    <section>
                        <h3>Case Studies</h3>
                        <ul>
                            {buildingArray.map((type, index) => {
                                return (
                                    <li key={index}>
                                        <Link href={`/search?q=${type}`}>
                                            {type}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </section>
                    <section>
                        <h3>Articles</h3>
                    </section>

                </section>


                {/* *footer */}
                <section className={styles.menuFooter}>

                    <Link href={'/'}>
                        <Image
                            priority
                            src={logo}
                            alt="Architecture Nigeria Logo"
                            width={100}
                            height={70}
                        />
                    </Link>
                    <div className={styles.permalinks}>
                        <Link href={'/about'}>About</Link>
                        <Link href={'/contact'}>Contact Us</Link>
                    </div>
                    <small>
                        <FontAwesomeIcon icon={faCopyright} /> 2023, archi NG
                    </small>


                </section>
            </div>

        </div>
    )
}

export default Menu