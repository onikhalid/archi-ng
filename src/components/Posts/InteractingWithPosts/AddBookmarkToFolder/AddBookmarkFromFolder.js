import styles from './AddBookmarkToFolder.module.scss'
import Image from 'next/image';
import { db, auth } from '@/utils/firebase';
import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderPlus } from "@fortawesome/free-solid-svg-icons";
import { addBookmarkToFolder } from '@/functions/Bookmark';
import { useWindowWidth } from '@/utils/Hooks/ResponsiveHook';

///////////////////////////////////////////////////////////////////////////////////
///        little menu to show all the bookmarks a user has created so        /////
///        they can add them to folders                                      /////
//////////////////////////////////////////////////////////////////////////////////
export const AddBookmarkFromFolder = ({ userId, folderId }) => {
    const [user, loading] = useAuthState(auth);
    const [userBookmarksList, setUserBookmarksList] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const wrapperRef = useRef(null)
    const width = useWindowWidth()



    useEffect(() => {
        const getUserBookmarks = async () => {
            const userBookmarksQuery = query(collection(db, "bookmarks"), where("userId", "==", userId))
            try {
                const unsub = onSnapshot(userBookmarksQuery, async (snapshot) => {
                    const bookmarkList = [];
                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        bookmarkList.push(data);
                        setUserBookmarksList(bookmarkList)
                    });
                    return unsub
                })
            } 
            catch (error) {
                console.log(error)
            }
        }
        getUserBookmarks()

    }, [userBookmarksList, userId]);




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
            return 'menu bookmarks'
        } else if (menuOpen == true) {
            return 'menu bookmarks open'
        } else return 'menu bookmarks close'
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
                Add Bookmarks to Folder <FontAwesomeIcon icon={faFolderPlus} />
            </div>

            <ul role="contextmenu" className={menuclasses()}>
                {
                    userBookmarksList.length < 1 &&
                    <li>
                        You haven&apos;t saved any post
                    </li>
                }
                {
                    userBookmarksList.map((bookmark, index) => {
                        return (
                            <li
                                className='option' key={index}
                                onClick={() => addTo(bookmark)}
                                title={`${bookmark.postTitle} by ${bookmark.postAuthorName}`}
                            >
                                <span className='title'>
                                    {/*ugly code cos why not 😴*/}
                                    {bookmark.postTitle.substring(0, 30)}{bookmark.postTitle.length > 30 && "..."}
                                </span>
                                <br />
                                <span className='author'>
                                    <Image src={bookmark.postAuthorPhoto} height={20} width={20} alt='author photo' />
                                    {bookmark.authorName}
                                </span>

                            </li>
                        )
                    })
                }
            </ul>

        </article>
    )
}