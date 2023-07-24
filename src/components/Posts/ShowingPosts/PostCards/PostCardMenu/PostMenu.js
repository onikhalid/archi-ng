import styles from './PostMenu.module.scss'
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { faEllipsis, faUserMinus, faUserPlus, faShare, faPen, faBookmark, faClipboard, faPaste } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuthState } from 'react-firebase-hooks/auth';
import { addFollow, removeFollow } from '@/components/Posts/InteractingWithPosts/Likes and Comments/Following';
import { addBookmark } from '@/components/Posts/InteractingWithPosts/Likes and Comments/Bookmark';
import { auth, db } from '@/utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';


export default function PostMenu({ menuOpen, setOpen, post }) {
    const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
    const postType = post.postType
    const linkType = postType == "Articles" ? 'article' : 'case-study'
    const postLink = `${baseURL}/post/${linkType}/${post.postId}`
    const authorId = post.authorId
    const postId = post.postId
    const postTitle = post.title
    const postAuthorName = post.authorName
    const postAuthorPhoto = post.authorAvatar
    const postAuthorId = post.authorId
    const postCoverPhoto = post.coverImageURL

    const [user, loading] = useAuthState(auth)
    const [following, setFollowing] = useState(true);
    const wrapperRef = useRef(null);
    const router = useRouter()

    ////////////////////////////////////
    // menu and submenu class to show or hide menu
    let menuclass = `${styles.menuitems}`
    if (menuOpen === null) {
        menuclass = `${styles.menuitems}`
    } else if (menuOpen === false) {
        menuclass = `${styles.menuitems} ${styles.close}`
    } else {
        menuclass = `${styles.menuitems} ${styles.open}`
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
            const followingDocRef = doc(db, 'follows', `${user?.uid}_follows_${authorId}`)
            const docSnap = await getDoc(followingDocRef)
            if (docSnap.exists()) {
                setFollowing(true)
            } else {
                setFollowing(false)
            }
        }

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
            // userId, postId, postTitle, postType, postAuthorId, postCoverPhoto, postAuthorName, postAuthorPhoto
            addBookmark(userid, postId, postTitle, postType, postAuthorId, postCoverPhoto, postAuthorName, postAuthorPhoto)
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
                {user && user?.uid == authorId && <li onClick={() => router.push(`/post?edit=${postId}&type=${postType}`)}><FontAwesomeIcon icon={faPen} /> Edit Post</li>}
                <li onClick={() => copyTextToClipboard(postLink)}><FontAwesomeIcon icon={faPaste} /> Copy Link</li>
                <li onClick={() => bookmark(postId, user?.uid)}><FontAwesomeIcon icon={faBookmark} /> Bookmark</li>
            </ul>
        </article>
    );
}