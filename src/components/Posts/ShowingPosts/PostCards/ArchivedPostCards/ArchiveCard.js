"use client"
import styles from "./ArchiveCard.module.scss"
import { db, auth } from "@/utils/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useLayoutEffect, useState } from "react"
import Link from "next/link"
import Button from "@/components/Button/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faArrowUpRightFromSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { AddBookmarkToFolderMenu } from "@/components/Posts/InteractingWithPosts/AddBookmarkToFolder/AddBookmarkToFolder"
import { useAuthState } from "react-firebase-hooks/auth"
import { useWindowWidth } from "@/utils/Hooks/ResponsiveHook"
import { deleteBookmark, deleteFolder } from "@/functions/Bookmark"



export const BookmarkCard = ({ post }) => {

    const [archivedPostExists, setArchivedPostExists] = useState(null);
    const [user, loading] = useAuthState(auth);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [showmenu, setshowmenu] = useState(null);
    const width = useWindowWidth();

    const { userId, postId, bookmarkId, postTitle, postType, postAuthorId, postCoverPhoto, postAuthorName, postAuthorPhoto } = post || {}
    const bookmarkOwnerId = userId


    useLayoutEffect(() => {
        setLoadingPosts(true)
        const postId = post.postId

        const checkArchivedPostExists = async () => {

            const postRef = doc(db, `posts/${postId}`)
            const result = await getDoc(postRef)
            if (result.exists()) {
                setArchivedPostExists(true)
            }

            setLoadingPosts(false)
        }

        checkArchivedPostExists()
    }, [post]);



    const type = () => {
        if (archivedPostExists == null) {
            return ''
        }
        else if (postType === 'Articles') {
            return 'article'
        } else if (postType === 'Case Studies') {
            return 'case-study'
        }else if (postType === 'Discussions') {
            return 'discuss'
        }
        else if (postType === 'Photography') {
            return 'photo'
        }
    }



    let bottomclass
    if (showmenu === null) {
        bottomclass = `${styles.bottom}`
    } else if (showmenu === false) {
        bottomclass = `${styles.bottom}`
    } else {
        bottomclass = `${styles.bottom} ${styles.menuisopen}`
    }






    return (
        <>
            {
                post && loadingPosts && !archivedPostExists && <div className="infobox">Loading...</div>
            }
            {
                post && !loadingPosts && !archivedPostExists &&
                <div className={styles.deletedbookmark}>
                    Bookmarked post doesn&apos;t exist or it has been deleted by author
                    {post.userId == user?.uid &&
                        <span title="delete bookmark" onClick={() => deleteBookmark(bookmarkId, user.uid, postId, "deleted")} className={styles.deleteicon}>
                            <FontAwesomeIcon icon={faTrash} />
                            Delete Bookmark
                        </span>
                    }
                </div>
            }


            {(!loadingPosts && archivedPostExists && postTitle )&&
                <article className={styles.bookmarkcard} title={postTitle}
                    onMouseOver={() => setshowmenu(true)} onMouseLeave={() => setshowmenu(false)}
                >
                    {user && (showmenu || width < 1020) &&
                        <AddBookmarkToFolderMenu
                            userId={user.uid}
                            bookmarkId={bookmarkId}
                            bookmarkOwnerId={bookmarkOwnerId}
                        />}

                    <section className={styles.up}>
                        <aside className={styles.posttype} >{type()}</aside>
                        <img
                            src={postCoverPhoto}
                            width={300}
                            height={170}
                            alt="post cover image"
                        />
                    </section>

                    <section className={width < 1020 ? `${styles.bottom} ${styles.menuisopen}` : bottomclass}>
                        <div className={styles.bottomtop}>
                            <h3 title={postTitle ? postTitle : ""}>{postTitle?.substring(0, 36)}{(loadingPosts == false && postTitle?.length > 36) && '...'}</h3>
                            {
                                bookmarkOwnerId == user?.uid &&
                                <span title="delete bookmark" onClick={() => deleteBookmark(bookmarkId, user.uid, postId)} className={styles.deleteicon}>
                                    <FontAwesomeIcon icon={faTrash} />
                                    Delete Bookmark
                                </span>
                            }
                        </div>
                        <div className={styles.other}>
                            <Link className={styles.author} href={`/profile?id=${postAuthorId}`}>
                                <img src={postAuthorPhoto}
                                    width={30}
                                    height={30}
                                    alt="post author avatar"
                                />
                                <h6 title={postAuthorName}>{postAuthorName.substring(0, 20)}</h6>
                            </Link>
                            <Button name={"Read"} icon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />} link={`/post/${type()}/${postId}`} type={"type4"} />

                        </div>

                    </section>
                </article>
            }

        </>

    )
}













///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////            FOLDER CARD            //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


export const FolderCard = ({ post }) => {
    const [user, loading] = useAuthState(auth);

    return (
        <article className={styles.folderCard}>
            <Link href={`/archive/folder/${post.folderId}`}>
                <div className={styles.docket}>
                    <FontAwesomeIcon icon={faFolder} />
                </div>
                <h5 title={post.folderName}>{post.folderName?.substring(0, 9)}{post.folderName?.length > 9 && "..."}</h5>
                <h6>{post.bookmarks?.length} posts</h6>
            </Link>
            {post.userId == user?.uid &&
                <button onClick={() => deleteFolder(post.folderId)} className={styles.deletebutton}>
                    <FontAwesomeIcon icon={faTrash} /> Delete
                </button>
            }
        </article>
    )
}

