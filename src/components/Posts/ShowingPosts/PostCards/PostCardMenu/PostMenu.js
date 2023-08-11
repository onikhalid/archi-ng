import styles from './PostMenu.module.scss'
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { faEllipsis, faUserMinus, faUserPlus, faShare, faPen, faBookmark, faClipboard, faPaste, faMapPin, faThumbTack, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuthState } from 'react-firebase-hooks/auth';
import { addFollow, removeFollow } from '@/functions/Following';
import { addBookmark, pinPost, unpinPost } from '@/functions/Bookmark';
import { deletePost } from '@/functions/Delete';
import { auth, db } from '@/utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';


export default function PostMenu({ menuOpen, setOpen, post, smallpost }) {
    const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
    const { postId, postType, postContent, title, coverImageURL, authorId, authorName, authorAvatar } = post

    const linkType = postType == "Articles" ? 'article' : 'case-study'
    const postLink = `${baseURL}/post/${linkType}/${post.postId}`

    const [user, loading] = useAuthState(auth)
    const [following, setFollowing] = useState(true);
    const [pinned, setPinned] = useState(true);
    const wrapperRef = useRef(null);
    const router = useRouter()

    ////////////////////////////////////
    // menu and submenu class to show or hide menu
    let menuclass = `${styles.menuitems}`
    if (menuOpen === null) {
        menuclass = !smallpost ? `${styles.menuitems}` : `${styles.menuitems} ${styles.small}`
    } else if (menuOpen === false) {
        menuclass = !smallpost ? `${styles.menuitems} ${styles.close}` : `${styles.menuitems} ${styles.close} ${styles.small}`
    } else {
        menuclass = !smallpost ? `${styles.menuitems} ${styles.open}` : `${styles.menuitems} ${styles.open} ${styles.small}`
    }
    const openMenu = () => {
        if (menuOpen === null) {
            setOpen(true)
        } else if (menuOpen === false) {
            setOpen(true)
        } else {
            setOpen(false)
        }
    }




    //////////////////////////////////////////////////////
    // check if user follows post author on component mountt 

    useEffect(() => {

        const checkFollow = async () => {
            const authorDocRef = doc(db, `users/${authorId}`);
            const authorDocSnap = await getDoc(authorDocRef)
            const authorData = authorDocSnap.data()

            if (authorData.followers && authorData.followers.includes(user?.uid)) {
                setFollowing(true)
            } else {
                setFollowing(false)
            }
        }


        const checkPinned = async () => {
            try {
                const userDocRef = doc(db, `users/${authorId}`)
                const userDocSnap = await getDoc(userDocRef)
                const userData = userDocSnap.data()
                if (userData.pinnedPosts && userData.pinnedPosts.includes(postId)) {
                    setPinned(true);
                } else {
                    setPinned(false);
                }
            } catch (error) {
                if (error.code === "failed-precondition") {
                    toast.error("Bad internet connection")
                }
            }

        }



        checkPinned()
        checkFollow()
    }, [user, authorId]);


    ///////////////////////////////
    // handle follow and unfollow
    const followNotFollow = async () => {
        setOpen(false)
        if (following === true) {
            await removeFollow(user.uid, authorId)
            setFollowing(false)
        } else {
            await addFollow(user.uid, authorId)
            setFollowing(true)
        }
    }



    ///////////////////////////////
    // handle follow and unfollow
    const pinNotPin = async () => {
        setOpen(false)
        if (pinned === true) {
            await unpinPost(authorId, postId)
            setPinned(false)
        } else {
            await pinPost(authorId, postId)
            setPinned(true)
        }
    }



    ///////////////////////////////
    // copy post link to clipboard
    const copyTextToClipboard = (text) => {
        setOpen(false)
        if (!navigator.clipboard) {
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            toast.success("Link has been copied to your clipboard", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 3500,
            });

        }, () => {
            console.error("Failed to copy");
        });
    }



    /////////////////////////////////
    // add/create bookmark
    const bookmark = (postId, userid) => {
        if (!user || userid == undefined) {
            toast.error("Sign in to save posts", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 3500,
            });
        } else {
            setOpen(false)
            // userId, postId, title, postType, authorId, coverImageURL, authorName, authorAvatar
            addBookmark(userid, postId, title, postType, authorId, coverImageURL, authorName, authorAvatar)
        }

    }


    //////////////////////////////////////////
    // Close menu when user clicks outside it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && menuOpen && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [menuOpen]);










    return (
        <article className={styles.menu} ref={wrapperRef}>
            <span onClick={openMenu} className={styles.toggle}>
                <FontAwesomeIcon icon={faEllipsis} />
            </span>
            <ul role="contextmenu" className={menuclass}>
                {
                    user && user?.uid != authorId &&
                    <li onClick={followNotFollow}>
                        {
                            following ?
                                <span><FontAwesomeIcon icon={faUserMinus} /> Unfollow  </span> :
                                <span><FontAwesomeIcon icon={faUserPlus} /> Follow  </span>
                        }
                    </li>
                }
                {user && user?.uid == authorId &&
                    <li onClick={pinNotPin}>
                        {
                            pinned ?
                                <span><FontAwesomeIcon icon={faThumbTack} /> Unpin Post </span> :
                                <span><FontAwesomeIcon icon={faThumbTack} /> Pin to Profile  </span>
                        }
                    </li>
                }
                {user && user?.uid == authorId && <li onClick={() => router.push(`/post?edit=${postId}&type=${postType}`)}><FontAwesomeIcon icon={faPen} /> Edit Post</li>}
                {user && user?.uid == authorId && <li onClick={() => deletePost(postId, postContent, coverImageURL)}><FontAwesomeIcon icon={faTrash} /> Delete Post</li>}
                <li onClick={() => copyTextToClipboard(postLink)}><FontAwesomeIcon icon={faPaste} /> Copy Link</li>
                <li onClick={() => bookmark(postId, user?.uid)}><FontAwesomeIcon icon={faBookmark} /> Bookmark</li>
            </ul>
        </article>
    );
}