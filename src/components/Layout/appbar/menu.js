"use client"

import styles from "./menu.module.scss"
import { useContext } from 'react';
import { ThemeContext, UserContext } from '@/utils/ContextandProviders/Contexts';
import { useWindowWidth } from "@/utils/Hooks/ResponsiveHook";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopyright, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import Button from "@/components/Button/button";
import { toast } from "react-toastify";




const Menu = ({ menuOpen, setMenuOpen, menuclass, setMenuClass }) => {
    const router = useRouter()
    const { theme, toggleTheme } = useContext(ThemeContext);
    const logo = theme === 'light' ? "/assets/logo/logo-dark.svg" : "/assets/logo/logo-light.svg"
    const { userData, authenticatedUser, loadingAuthenticatedUser } = useContext(UserContext);

    const width = useWindowWidth()
    const buildingTypologies = ["Residential", "Commercial", "Institutional", "Industrial", "Religious", "Transportation", "Hospitality", "Educational", "Mixed Use", "Cultural and Recreational", "Civic and Government"];
    const buildingArray = width < 720 ? buildingTypologies.slice(0, 8) : buildingTypologies

    const articlesTypologies = ["News", "How-Tos and Tutorials", "Architectural Tours", "Famous Architects and their Works", "Architectural Travel", "Architecture and Technology "];
    const articlesArray = width < 720 ? articlesTypologies.slice(0, 5) : articlesTypologies


    const logOut = async () => {
        await setMenuOpen(false)
        await setMenuClass(`appbar_menu__RWEMy appbar_menuClose__BM0_l`)

        toast.success("Succesfully signed out", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000,
        });
        auth.signOut()
    }
    const closemenu = async () => {
        await setMenuOpen(false)
        await setMenuClass(`appbar_menu__RWEMy appbar_menuClose__BM0_l`)
    }








    return (
        <>
            {menuOpen && <title>Menu | Archi NG</title>}

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

                            {
                                authenticatedUser ?
                                    <Link href={`/profile/${userData.username}`} className={styles.user} onClick={closemenu}>
                                        <h6>{authenticatedUser?.displayName}</h6>
                                        {
                                            !loadingAuthenticatedUser && authenticatedUser &&

                                            <Image
                                                src={authenticatedUser?.photoURL || logo}
                                                alt={`picture - ${authenticatedUser?.displayName}`}
                                                width={40}
                                                height={40}
                                            />

                                        }
                                    </Link>
                                    :

                                    <Button name='Sign in' type='quinta' link='/auth' />
                            }



                        </section>

                        {
                            width < 720 &&
                            <section>
                                {!loadingAuthenticatedUser && authenticatedUser && <span onClick={closemenu}><Button name={'Make Post'} link={"/post"} type={"quinta"} /></span>}
                                {authenticatedUser && <span className={styles.logout} onClick={logOut}> <FontAwesomeIcon icon={faRightFromBracket} /> Logout</span>}
                            </section>
                        }
                    </section>



                    {/* *contents */}
                    <section className={styles.menuContents}>

                        <section className={styles.casestudies}>
                            <h3>Case Studies</h3>
                            <ul>
                                {buildingArray.map((type, index) => {
                                    return (
                                        <li key={index} onClick={closemenu}>
                                            <Link href={`/search?q=${type}&category=Studies`}>
                                                {type}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </section>

                        <section className={styles.articles}>
                            <h3>Articles</h3>
                            <ul>
                                {articlesArray.map((type, index) => {
                                    return (
                                        <li key={index} onClick={closemenu}>
                                            <Link href={`/search?q=${type}&category=Articles`}>
                                                {type}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
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
                            <Link href={'/settings'} onClick={closemenu}>{width > 1279 && "App"} Settings</Link>
                            <Link href={'/about'} onClick={closemenu}>About {width > 1279 && "Archi NG"}</Link>
                            <Link href={'/contact'} onClick={closemenu}>Contact {width > 1279 && "Us"} </Link>
                            <Link href={'/faqs'} onClick={closemenu}>FAQs</Link>
                            <Link href={'/policy'} onClick={closemenu}>{width > 1279 && "Privacy"} Policy</Link>
                            <Link href={'/terms'} onClick={closemenu}>{width > 1279 ? "Terms and Conditions" : "Terms"}</Link>
                        </div>
                        <small>
                            All rights reserved.  <FontAwesomeIcon icon={faCopyright} /> 2023, archi NG
                        </small>


                    </section>
                </div>

            </div>
        </>
    )
}

export default Menu