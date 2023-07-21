import { db } from '@/utils/firebase';
import { useState, useEffect, useRef } from 'react';
import {
    collection, addDoc, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove,
    getDoc, setDoc, query, where, getDocs,
} from 'firebase/firestore';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleChevronDown, faCircleChevronUp } from "@fortawesome/free-solid-svg-icons";
import { faFolder, faArrowUpRightFromSquare, faFolderPlus, faEllipsis } from "@fortawesome/free-solid-svg-icons";
import Button from '@/components/Button/button';
import { addBookmarkToFolder } from '../Bookmark';
import styles from './AddBookmarkToFolder.module.scss'



////////////////////////////////////////////////////////////////////////////////
///        little menu to show all the folders a user has created so       /////
///        they can add bookmarks to them                                  /////
////////////////////////////////////////////////////////////////////////////////
export const AddToFolderMenu = ({ userId, bookmarkId, bookmarkOwnerId }) => {
    const [userfolderList, setUserFoldersList] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const wrapperRef = useRef(null)



    const getUserFolders = async () => {
        const userFoldersQuery = query(collection(db, "folders"), where("userId", "==", userId))
        const userFoldersSnap = await getDocs(userFoldersQuery)
        const data = []
        userFoldersSnap.forEach((doc) => {
            data.push(doc.data())
        });
        setUserFoldersList(data)
    }
    useEffect(() => {
        getUserFolders()

    }, []);


    const toggleMenu = () => {
        if (menuOpen == null) {
            setMenuOpen(true)
        } else if (menuOpen == true) {
            setMenuOpen(false)
        } else setMenuOpen(true)
    }

    const menuclasses = () => {
        if (menuOpen == null) {
            return 'menu wide'
        } else if (menuOpen == true) {
            return 'menu wide open'
        } else return 'menu wide close'
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



    const addTo = (userId, bookmarkId, folderId, bookmarkOwnerId)=>{
        addBookmarkToFolder(userId, bookmarkId, folderId, bookmarkOwnerId)
        setMenuOpen(false)
    }







    return (
        <article ref={wrapperRef} className={styles.menuwrapper}>
            <div className={styles.toggle} onClick={toggleMenu}>
                Add to Folder <FontAwesomeIcon icon={menuOpen ? faCircleChevronUp : faCircleChevronDown} />
            </div>

            <ul role="contextmenu" className={menuclasses()}>
                {
                    userfolderList.length < 1 &&
                    <li>
                        You haven't created any folder
                    </li>
                }
                {
                    userfolderList.map((folder, index) => {
                        return <li
                            className='option' key={index}
                            onClick={() => addTo(userId, bookmarkId, folder.folderId, bookmarkOwnerId)}
                        >
                            {folder.folderName} <FontAwesomeIcon icon={faFolderPlus} />
                        </li>
                    })
                }
            </ul>


        </article>
    )
}