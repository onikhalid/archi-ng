"use client"

import styles from './folderPage.module.scss'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faFolderPlus } from "@fortawesome/free-solid-svg-icons";


import { collection, getDocs, getDoc, doc, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useState, useEffect } from "react";
import Image from "next/image";
import { BookmarkCard } from "@/components/Posts/ShowingPosts/PostCards/ArchivedPostCards/ArchiveCard";
import { AddToFolderMenu } from "@/components/Posts/InteractingWithPosts/Likes and Comments/AddBookmarkToFolder/AddBookmarkToFolder";


export default function Page({ params }) {
    const { folderId } = params
    const [folderName, setFolderName] = useState()
    const [folderOwner, setFolderOwner] = useState('')
    const [user, loading] = useAuthState(auth)
    const [bookmarks, setBookmarks] = useState([]);

    const folderDocRef = doc(db, `folders/${folderId}`);



    const getFolderBookmarks = async () => {
        // if (!user) {
        //     return
        // }
        const folderDocsSnap = await getDoc(folderDocRef);

        if (folderDocsSnap.exists()) {

            const bookmarkIdsArray = folderDocsSnap.data().bookmarks
            setFolderName(folderDocsSnap.data().folderName)
            setFolderOwner(folderDocsSnap.data().userId)

            const getBookmarkData = bookmarkIdsArray.map(async (item) => {
                const ref = doc(db, `bookmarks/${item}`)
                const bookmarkDocSnap = await getDoc(ref)
                const bookmarkData = bookmarkDocSnap.data()
                return bookmarkData
            })

            const bookmarkData = await Promise.all(getBookmarkData);
            setBookmarks(bookmarkData)

        }
        else setBookmarks(null)
    }

    useEffect(() => {
        getFolderBookmarks()
    }, [folderId])

     




    return (
        <main className='content-container'>
            <header>
                <h1>{folderName} <FontAwesomeIcon icon={faFolder} /></h1>
            </header>
            {bookmarks == null && <div className="infobox">
                <h2>Folder doesnt exist</h2>
            </div>}
            {bookmarks != null &&
                <section className={styles.allBookmarks}>
                    {
                        bookmarks.map((bookmark, index) => {
                            return (
                                <article key={index} >
                                    <BookmarkCard post={bookmark} />
                                    {user&&user.uid == bookmark.userId &&<button>delete</button>}
                                </article>
                                )
                        })
                    }

                </section>
            }
        </main>

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
