"use client"

import styles from './folderPage.module.scss'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faFolderMinus, faTrash } from "@fortawesome/free-solid-svg-icons";


import { collection, getDocs, getDoc, doc, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useState, useEffect } from "react";
import { BookmarkCard } from "@/components/Posts/ShowingPosts/PostCards/ArchivedPostCards/ArchiveCard";
import { AddBookmarkFromFolder } from "@/components/Posts/InteractingWithPosts/AddBookmarkToFolder/AddBookmarkFromFolder";
import { removeBookmarkFromFolder } from '@/functions/Bookmark';


export default function Page({ params }) {
    const { folderId } = params
    const [user, loading] = useAuthState(auth)
    const [folderName, setFolderName] = useState()
    const [folderOwnerId, setFolderOwnerId] = useState('')
    const [folderOwnerName, setFolderOwnerName] = useState('')
    const [bookmarks, setBookmarks] = useState([]);





    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////
    /////////     GET FOLDER BOOKMARKS        ///////////
    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////
    useEffect(() => {
        const folderDocRef = doc(db, `folders/${folderId}`);

        const getFolderBookmarks = async () => {
            try {
                const unsub = onSnapshot(folderDocRef, async (snapshot) => {
                    if (snapshot.data()) {
                        const folder = snapshot.data();
                        setFolderName(folder.folderName)
                        setFolderOwnerId(folder.userId)
                        setFolderOwnerName(folder.folderOwnerName)
                        const folderBookmarks = folder.bookmarks

                        const getBookmarkData = folderBookmarks.map(async (item) => {
                            const ref = doc(db, `bookmarks/${item}`)
                            const bookmarkDocSnap = await getDoc(ref)
                            const bookmarkData = bookmarkDocSnap.data()
                            return bookmarkData
                        })
                        const bookmarkData = await Promise.all(getBookmarkData);
                        setBookmarks(bookmarkData)

                    }

                    else setBookmarks(null)
                });
                return unsub
            } catch (error) {
                if (error.code === 'FirestoreError.ClientOffline') {
                    alert('You are offline. Please connect to the internet to access this data.');
                } else {
                    console.log(error)
                }
            }

        }

        getFolderBookmarks()

    }, [folderId])




    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    /////////     ADD/REMOVE BOOKMARKS FROM FOLDER   ///////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////

    const removeBookmark = (bookmark) => {
        const bookmarkId = `${bookmark.userId}_${bookmark.postId}`
        removeBookmarkFromFolder(bookmarkId, folderId)
    }



    ////////////////////////////////////////////////////////////
    ////////////             PAGE TITLE            /////////////
    let pageTitle
    if (folderName !== undefined) {
        pageTitle = `Folder: ${folderName} - by ${folderOwnerName} | archi NG`

    } else pageTitle = "Unknown Folder | archi NG"




    



    return (
        <>
            <title>{pageTitle}</title>

            <main className='content-container'>
                <header className={styles.pageHeader}>
                    <div className={styles.folderNameandOwner}>
                        <h1>{folderName} <FontAwesomeIcon icon={faFolder} /></h1>
                        <h6> by {folderOwnerName !== '' ? folderOwnerName : "Uknown"}</h6>
                    </div>
                    {
                        /* // allow folder owner to add bookmark to folder from this page*/
                        user && folderOwnerId === user.uid &&
                        <AddBookmarkFromFolder
                            userId={folderOwnerId} folderId={folderId}
                        />
                    }
                </header>


                {bookmarks == null && <div className="infobox">
                    {/* //non existent older */}
                    <h2>Folder doesn&apos;t exist</h2>
                </div>}



                {bookmarks != null &&
                    <section className={styles.allBookmarks}>
                        {
                            bookmarks.length < 1 &&
                            <div className='infobox'>
                                <h1>😶</h1>
                                <h2 >
                                    Empty folder
                                </h2>
                            </div>
                        }
                        {
                            bookmarks.length > 0 && bookmarks.map((bookmark, index) => {
                                return (
                                    <article className={styles.folderBookmarkCard} key={index} >

                                        <BookmarkCard post={bookmark} />
                                        {user && user.uid == folderOwnerId &&
                                             <button onClick={() => removeBookmark(bookmark)} className={styles.button}>
                                                <FontAwesomeIcon icon={faTrash} /> Remove from folder
                                            </button>
                                        } 
                                    </article>

                                )
                            })
                        }

                    </section>
                }
            </main>

        </>
    )
}





export const dynamicParams = false;

export async function generateStaticParams() {
    const foldersCollectionRef = collection(db, 'folders');
    const foldersDocs = await getDocs(foldersCollectionRef)

    return foldersDocs.docs.map((doc) => ({
        folderId: doc.data().folderId,
    }));
}
