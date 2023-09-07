"use client"

import styles from './profile.module.scss'
import { useRouter } from 'next/navigation';

import { collection, getDocs, getDoc, doc, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useState, useEffect, useLayoutEffect } from "react";
import { useWindowWidth } from '@/utils/Hooks/ResponsiveHook';
import Image from 'next/image';
import Button from '@/components/Button/button';
import WhoseandWhichpost from '@/components/Posts/ShowingPosts/Whosepost/whosepost';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faGear, faThumbTack } from "@fortawesome/free-solid-svg-icons";
import { SmallPostCard } from '@/components/Posts/ShowingPosts/PostCards/SmallPostCard';
import { FolderCard } from '@/components/Posts/ShowingPosts/PostCards/ArchivedPostCards/ArchiveCard';
import { addFollow, removeFollow } from '@/functions/Following';

import { FollowersFollowingandLikesList } from '@/components/Profile/Followers,FollowingandLikesList';
import Link from 'next/link';
import { faBehance, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { toast } from 'react-toastify';




export default function Page({ params }) {
    const { username } = params
    const router = useRouter()
    const width = useWindowWidth()
    const [user, loading] = useAuthState(auth);
    const [loadingProfile, setloadingProfile] = useState(true);
    const [currentSection, setCurrentSection] = useState("Profile");
    const [following, setfollowing] = useState(null);
    const [userPosts, setUserPosts] = useState(null);
    const [userFolders, setUserFolders] = useState(null);
    const [userInfo, setUserInfo] = useState(null);


    const sections = [
        {
            number: 1,
            name: "Profile",
        },
        {
            number: 2,
            name: "Posts",
        },
        {
            number: 3,
            name: "Folders",
        }
    ];





    /////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////
    ///////////////////     GET USERS INORMATION        /////////////////////
    /////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////
    useLayoutEffect(() => {
        setloadingProfile(true)

        const usersCollection = collection(db, "users")
        const userQuery = query(usersCollection, where('username', '==', username));


        const checkUserExists = async () => {
            const userDocSnap = await getDocs(userQuery)
            if (userDocSnap.docs.length < 1) {
                setUserInfo("Doesn't Exist")
                return
            } else {
                getUserInfo()
            }
        }







        const getUserInfo = async () => {

            const getBasicInfo = async () => {
                onSnapshot(userQuery, async (snapshot) => {
                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        setUserInfo(data)

                    });
                })
            }

            // check if signed-in user follows proile user on component mountt 
            const profileUserId = userInfo && userInfo.id
           
                if (user?.uid == userInfo.id) {
                    setfollowing(null)
                } else {

                    const profileUserDocRef = doc(db, `users/${profileUserId}`);
                    const profileUserDocSnap = await getDoc(profileUserDocRef)
                    const profileUserData = profileUserDocSnap.data()

                    if (profileUserData.followers && profileUserData.followers.includes(user?.uid)) {
                        setfollowing(true)
                    } else {
                        setfollowing(false)
                    }
                


                const getUserPosts = async () => {
                    const userProfileId = userInfo.id
                    const userPostsQuery = query(collection(db, "posts"), where('authorId', '==', userProfileId))
                    const unsubscribe = onSnapshot(userPostsQuery, (snapshot) => {
                        const newDataArray = [];
                        snapshot.forEach((doc) => {
                            const data = doc.data();
                            newDataArray.push(data);
                        });
                        setUserPosts(newDataArray)
                    })
                    return unsubscribe
                }


                const getUserFolders = async () => {
                    const userProfileId = userInfo.id
                    const userFoldersQuery = query(collection(db, "folders"), where('userId', '==', userProfileId))

                    const unsub = onSnapshot(userFoldersQuery, (snapshot) => {
                        const newDataArray = [];
                        snapshot.forEach((doc) => {
                            const data = doc.data();
                            newDataArray.push(data);
                        });
                        setUserFolders(newDataArray)
                    })
                    return unsub
                }



            }


            try {

                await getBasicInfo()
                await getUserPosts()
                await getUserFolders()


            } catch (error) {
                if (error.code === "failed-precondition") {
                    toast.error("Poor internet connection")
                }
                // else if (error.code === "auth/network-request-failed" || "unavailable") {
                //     toast.error("There appears to be a problem with your connection", {
                //         position: "top-center"
                //     })
                // }
                else if (error.message.includes('Backend didn\'t respond' || "[code=unavailable]")) {
                    toast.error("There appears to be a problem with your connection", {
                        position: "top-center"
                    })
                }
            }
        }


        checkUserExists()
        setloadingProfile(false)

        return () => { }
    }, [username, user, currentSection]);









    ///////////////////////////////
    // handle follow and unfollow
    const followUnfollow = async () => {
        if (following === true) {
            await removeFollow(user.uid, userInfo.id)
            setfollowing(false)
        } else {
            await addFollow(user.uid, userInfo.id)
            setfollowing(true)
        }
    }













    ////////////////////////////////////////////////////////////
    ////////////             PAGE TITLE            /////////////
    const pageTitle = `Profile - ${userInfo?.name} | Archi NG`

    return (
        <>
            <title>{pageTitle}</title>

            <main className='content-container'>
                <header className={styles.header}>
                    <div className={currentSection === "Profile" ? "" : `${styles.pagetitle}`}>
                        <h1>Profile</h1>
                        {
                            !loadingProfile && userInfo && currentSection != "Profile" &&
                            <Image
                                src={userInfo.profilePicture}
                                width={45}
                                height={45}
                                alt={`${userInfo.name} photo`}
                            />
                        }
                    </div>
                    <WhoseandWhichpost variations={sections} currentwhosePost={currentSection} setCurrentWhosePost={setCurrentSection} />
                </header>

                {
                    loadingProfile && <>Loading...</>
                }

                {
                    !loadingProfile && userInfo == "Doesn't Exist" &&
                    <div className="infobox">
                        <h3>User does&apos;t exists 🥱</h3>
                    </div>
                }


                {
                    !loadingProfile && userInfo && userInfo !== "Doesn't Exist" && currentSection === "Profile" &&

                    <section className={styles.profile}>
                        <section className={styles.userinfo}>
                            <div className={styles.main}>
                                <Image
                                    src={userInfo.profilePicture}
                                    width={150}
                                    height={150}
                                    alt={`${userInfo.name} photo`}
                                />
                                <div>
                                    <h3>{userInfo.name}</h3>
                                    {user.uid == userInfo.id && width < 720 && <Link href={'/settings'}><FontAwesomeIcon icon={faGear} /></Link>}

                                </div>
                                <h6 className={styles.username}>@{userInfo.username}</h6>
                                <h6>{userInfo.occupation}</h6>
                            </div>


                            <div className={styles.following}>
                                <h5>{userPosts?.length ? userPosts?.length : 0} <span>ArcPosts</span></h5>
                                <span>
                                    <h5>{userInfo.followers ? userInfo.followers.length : 0} <span>Followers</span></h5>
                                    <FollowersFollowingandLikesList userId={userInfo.id} username={userInfo.username} followers={userInfo.followers} />
                                </span>
                                <span>
                                    <h5>{userInfo.following ? userInfo.following.length : 0} <span>Following</span></h5>
                                    <FollowersFollowingandLikesList userId={userInfo.id} username={userInfo.username} following={userInfo.following} />
                                </span>


                            </div>



                            <div>
                                {
                                    (!loading && user) &&
                                    <>
                                        {(!loading && (user.uid == userInfo.id)) &&
                                            <Button name={'Make Post'} type={'quinta'} link={'/post'} />
                                        }

                                        {(!loading && (user.uid !== userInfo.id)) &&
                                            <Button name={following === true ? "Unfollow" : "Follow"} type={following === true ? "septima" : "sexta"} link={followUnfollow} />
                                        }
                                    </>
                                }


                            </div>

                            <div className={styles.bio}>
                                <p>
                                    {userInfo.bio}
                                </p>
                            </div>

                            <div className={styles.socials}>
                                <span className={(!userInfo.twitter || userInfo.twitter.length < 2) ? `${styles.disabledicon}` : `${styles.socialicon}`}>
                                    {
                                        !userInfo.twitter || userInfo.twitter.length < 2 ?
                                            <FontAwesomeIcon icon={faTwitter} />
                                            :
                                            <Link href={userInfo.twitter}><FontAwesomeIcon icon={faTwitter} /></Link>
                                    }
                                </span>

                                <span className={(!userInfo.instagram || userInfo.instagram.length < 2) ? `${styles.disabledicon}` : `${styles.socialicon}`}>
                                    {
                                        !userInfo.instagram || userInfo.instagram.length < 2 ?
                                            <FontAwesomeIcon icon={faInstagram} />
                                            :
                                            <Link href={userInfo.instagram}><FontAwesomeIcon icon={faInstagram} /></Link>
                                    }
                                </span>

                                <span className={(!userInfo.behance || userInfo.behance.length < 2) ? `${styles.disabledicon}` : `${styles.socialicon}`}>
                                    {
                                        !userInfo.behance || userInfo.behance.length < 2 ?
                                            <FontAwesomeIcon icon={faBehance} />
                                            :
                                            <Link href={userInfo.behance}><FontAwesomeIcon icon={faBehance} /></Link>
                                    }
                                </span>

                                <span className={(!userInfo.mail || userInfo.mail.length < 2) ? `${styles.disabledicon}` : `${styles.socialicon}`}>
                                    {
                                        !userInfo.mail || userInfo.mail.length < 2 ?
                                            <FontAwesomeIcon icon={faEnvelope} />
                                            :
                                            <Link href={userInfo.mail}><FontAwesomeIcon icon={faEnvelope} /></Link>
                                    }
                                </span>


                            </div>
                        </section>



                        <section className={styles.pinned}>
                            <h5>PINNED POSTS <FontAwesomeIcon icon={faThumbTack} /> </h5>
                            {
                                userInfo.pinnedPosts &&
                                <section className={styles.pinnedposts}>
                                    {
                                        userInfo.pinnedPosts.map((pin, index) => {
                                            return <SmallPostCard id={pin} key={index} />
                                        })
                                    }
                                </section>
                            }
                            {
                                !userInfo.pinnedPosts || userInfo.pinnedPosts.length == 0 &&
                                <div className='infobox'>
                                    <h5>{userInfo.name} hasn&apos;t pinned any post</h5>
                                </div>
                            }


                        </section>
                    </section>


                }




                {

                    !loadingProfile && userPosts && currentSection === "Posts" &&
                    <>
                        {
                            userPosts.length < 1 &&
                            <div className="infobox">
                                <h2>{userInfo.name} hasn&apos;t created any posts</h2>
                            </div>
                        }
                        {
                            userPosts.length > 0 &&
                            <section className={styles.posts}>
                                {
                                    userPosts.map((post, index) => {
                                        return <SmallPostCard post={post} key={index} />
                                    })
                                }
                            </section>
                        }
                    </>

                }




                {

                    !loadingProfile && userFolders && currentSection === "Folders" &&
                    <>
                        {
                            userFolders.length < 1 &&
                            <div className="infobox">
                                <h2>{userInfo.name} hasn&apos;t created any folders</h2>
                            </div>
                        }
                        {
                            <section className={styles.folders}>
                                {
                                    userFolders.map((folder, index) => {
                                        return <FolderCard post={folder} key={index} />
                                    })
                                }
                            </section>
                        }
                    </>
                }
            </main>

        </>
    )
}





export const dynamicParams = false;

export async function generateStaticParams() {
    const usersCollectionRef = collection(db, 'users');
    const usersDocs = await getDocs(usersCollectionRef)

    return usersDocs.docs.map((doc) => ({
        usernmae: doc.data().username,
    }));
}
