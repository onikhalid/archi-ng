import styles from './Followers,FollowingandLikesList.module.scss'
import Image from 'next/image';
import { db, auth } from '@/utils/firebase';
import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderPlus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { addBookmarkToFolder } from '@/functions/Bookmark';
import { useWindowWidth } from '@/utils/Hooks/ResponsiveHook';
import { useRouter } from 'next/navigation';


///////////////////////////////////////////////////////////////////////////////////
///        little menu to show all the followers and followings of a user     /////
///         and also all the likes on a post                                 /////
//////////////////////////////////////////////////////////////////////////////////
export const FollowersFollowingandLikesList = ({ userId, postId, followers, following }) => {
    const [user, loading] = useAuthState(auth);
    const [userName, setUserName] = useState("")
    const [userFollowers, setUserFollowers] = useState([]);
    const [userFollowing, setUserFollowing] = useState([]);
    const [postLikes, setPostLikes] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const wrapperRef = useRef(null)
    const width = useWindowWidth()
    const router = useRouter()



    useEffect(() => {
        const getNecessaryInfo = async () => {
            try {

                if (userId) {
                    const userDocRef = doc(db, `users/${userId}`);
                    const userDocSnap = await getDoc(userDocRef)
                    const userData = userDocSnap.data()
                    setUserFollowing(userData.following)
                    setUserName(userData.username)

                    const xfollowers = []
                    const xfollowing = []

                    userData.followers?.forEach(async (follower) => {
                        const followerDocRef = doc(db, `users/${follower}`)
                        const followerDocSnap = await getDoc(followerDocRef)
                        xfollowers.push(followerDocSnap.data())
                    })
                    userData.following.forEach(async (following) => {
                        const followingDocRef = doc(db, `users/${following}`)
                        const followingDocSnap = await getDoc(followingDocRef)
                        xfollowing.push(followingDocSnap.data())
                    })

                    setUserFollowers(xfollowers)
                    setUserFollowing(xfollowing)



                } else if (postId) {
                    const postDocRef = doc(db, `posts/${postId}`);
                    const postDocSnap = await getDoc(postDocRef)
                    const postData = postDocSnap.data()
                    const xLikes = []

                    postData.likes?.forEach(async (liker) => {
                        const likerDocRef = doc(db, `users/${liker}`)
                        const likerDocSnap = await getDoc(likerDocRef)
                        xLikes.push(likerDocSnap.data())
                    })

                    setPostLikes(xLikes)
                }
            }
            catch (error) {
                console.log(error)
            }
        }
        getNecessaryInfo()

    }, [user]);




    ////////////////////////////////////////
    ////// control menu
    const toggleMenu = () => {
        if (menuOpen == null) {
            setMenuOpen(true)
        } else if (menuOpen == true) {
            setMenuOpen(false)
        } else setMenuOpen(true)
    }

    const menuclasses = () => {
        if (menuOpen == null) {
            return 'menu following'
        } else if (menuOpen == true) {
            return 'menu following open'
        } else return 'menu following close'
    }

    //////////////////////////////////////////
    // Close menu when user clicks outside it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && menuOpen && !wrapperRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [menuOpen]);



    const addTo = (bookmark) => {
        addBookmarkToFolder(user.uid, bookmark.bookmarkId, folderId, bookmark.authorId, "prevent error")
        setMenuOpen(false)
    }







    return (
        <article ref={wrapperRef} className={`${styles.menuwrapper} ${styles.noboxshadow}`}>
            <div className={styles.toggle} onClick={toggleMenu}>
                <FontAwesomeIcon icon={faPlus} />
            </div>

            <ul role="contextmenu" className={menuclasses()}>
                {
                    followers && (userFollowers?.length < 1 || !userFollowers) &&
                    <li>
                        No one follows {user?.uid === userId ? "you" : userName}
                    </li>
                }
                {
                    following && (userFollowing?.length < 1 || !userFollowing) &&
                    <li>
                        {user?.uid === userId ? "You don't" : `${userName} doesn't`} follow anyone
                    </li>
                }
                {
                    followers && userFollowers && userFollowers.map((follower, index) => {
                        return (
                            <li
                                className='option' key={index}
                                onClick={() => router.push(`${follower.username}`)}
                            >
                                <span className='name'>
                                    {follower.name}
                                </span>
                                <br />
                                <span className='username'>
                                    <Image src={follower.profilePicture} height={30} width={30} alt={`${follower.name} photo` || 'user photo'} />
                                    {follower.username}
                                </span>

                            </li>
                        )
                    })
                }
                {
                    following && userFollowing && userFollowing.map((following, index) => {
                        return (
                            <li
                                className='option' key={index}
                                onClick={() => router.push(`${following.username}`)}
                            >
                                <span className='name' title={following.name}>
                                    {following.name.substring(0, 30)}
                                </span>
                                <br />
                                <span className='username'>
                                    <Image src={following.profilePicture} height={30} width={30} alt={`${following.name} photo` || 'user photo'} />
                                    {following.username}
                                </span>

                            </li>
                        )
                    })
                }
            </ul>

        </article>
    )
}