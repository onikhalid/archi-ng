"use client"

import styles from './profile.module.scss'
import { useRouter } from 'next/navigation';

import { collection, getDocs, getDoc, doc, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useState, useEffect } from "react";

import Image from 'next/image';
import Button from '@/components/Button/button';
import WhoseandWhichpost from '@/components/Posts/ShowingPosts/Whosepost/whosepost';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbTack } from "@fortawesome/free-solid-svg-icons";
import { SmallPostCard } from '@/components/Posts/ShowingPosts/PostCards/SmallPostCard';
import { FolderCard } from '@/components/Posts/ShowingPosts/PostCards/ArchivedPostCards/ArchiveCard';
import { addFollow, removeFollow } from '@/components/Posts/InteractingWithPosts/Likes and Comments/Following';



export default function Page({ params }) {
    const { username } = params
    const router = useRouter()
    const [user, loading] = useAuthState(auth);
    const [loadingProfile, setloadingProfile] = useState(false);
    const [currentSection, setCurrentSection] = useState("Profile");
    const [following, setfollowing] = useState(null);
    const [userExists, setUserExists] = useState(true);
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
    useEffect(() => {
        setloadingProfile(true)


        const getBasicInfo = async () => {
            const usersCollection = collection(db, "users")
            const userQuery = query(usersCollection, where('username', '==', username));
            const userDocSnap = await getDocs(userQuery)

            const results = [];
            userDocSnap.forEach((user) => {
                if (user.data()) {
                    results.push(user.data())
                }
                else return
            })
            setUserInfo(results[0])
            return results[0]
        }


        const getOtherInfo = async () => {
            const userdata = await getBasicInfo()
            if (!userdata) {
                setUserExists(false)
                return
            }

            // check if signed-in user follows proile user on component mountt 
            const userProfileId = userdata.id
            if (user?.uid == userdata.id) {
                setfollowing(null)
            } else {
                const followingDocRef = doc(db, 'follows', `${user?.uid}_follows_${userProfileId}`)
                const docSnap = await getDoc(followingDocRef)
                if (docSnap.exists()) {
                    setfollowing(true)
                } else {
                    setfollowing(false)
                }
            }


            const getUserPosts = async () => {
                const userProfileId = userdata.id
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
            await getUserPosts()


            const getUserFolders = async () => {
                const userProfileId = userdata.id
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

            await getUserFolders()
        }


        getOtherInfo()
        setloadingProfile(false)

        return () => { }
    }, [username, user, following, currentSection]);





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
    const pageTitle = `Profile - ${userInfo?.name} | archi NG`

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
                    !loadingProfile && !userExists &&
                    <div className="infobox">
                        <h2>User does&apos;t exists 🥱</h2>
                    </div>
                }

                {
                    !loadingProfile && userInfo && currentSection === "Profile" &&

                    <section className={styles.profile}>
                        <section className={styles.userinfo}>
                            <div className={styles.main}>
                                <Image
                                    src={userInfo.profilePicture}
                                    width={200}
                                    height={200}
                                    alt={`${userInfo.name} photo`}
                                />
                                <h3>{userInfo.name}</h3>
                                <h6 className={styles.username}>@{userInfo.username}</h6>
                                <h6>{userInfo.occupation}</h6>
                            </div>

                            <div>
                                {
                                    (!loading && user) &&
                                    <>
                                        {(!loading && (user.uid == userInfo.id)) &&
                                            <Button name={'Make Post'} type={'quinta'} link={'/post'} />
                                        }

                                        {(!loading && (user.uid !== userInfo.id)) &&
                                            <Button name={following ? "Unfollow" : "Follow"} type={following ? "septima" : "sexta"} link={followUnfollow} />
                                        }
                                    </>
                                }


                            </div>

                            <div className={styles.following}>
                                <h5>{userPosts?.length ? userPosts?.length : 0} <span> Posts </span></h5>
                                <h5>{userInfo.followersCount ? userInfo.followersCount : 0} <span>Followers</span></h5>
                                <h5>{userInfo.followingCount ? userInfo.followingCount : 0} <span>Following</span></h5>
                            </div>

                            <div>
                                <p>
                                    {userInfo.bio}
                                </p>
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
                                    !userInfo.pinnedPosts &&
                                    <div className='infobox'>
                                        <h3>User hasn&apos;t pinned any post</h3>
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
