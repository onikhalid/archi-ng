"use client"
import styles from "./ArchiveCard.module.scss"
import { db, auth } from "@/utils/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useLayoutEffect, useState } from "react"
import Link from "next/link"
import Button from "@/components/Button/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faArrowUpRightFromSquare, faFolderPlus } from "@fortawesome/free-solid-svg-icons";
import { AddToFolderMenu } from "@/components/Posts/InteractingWithPosts/Likes and Comments/AddBookmarkToFolder/AddBookmarkToFolder"
import { useAuthState } from "react-firebase-hooks/auth"
import { useWindowWidth } from "@/utils/Hooks/ResponsiveHook"

export const BookmarkCard = ({ post }) => {

    const [archivedPost, setArchivedPost] = useState({});
    const [user, loading] = useAuthState(auth);
    const [loadingPosts, setLoadingPosts] = useState(null);
    const [showmenu, setshowmenu] = useState(null);
    const width = useWindowWidth();
    const bookmarkId = `${post.userId}_${post.postId}`
    const bookmarkOwnerId = post.userId


    useLayoutEffect(() => {
        const getArchivedPostsInfo = async () => {
            setLoadingPosts(true)

            const postRef = doc(db, `posts/${post.postId}`)
            const result = await getDoc(postRef)
            setArchivedPost(result.data())

            setLoadingPosts(false)
        }
        getArchivedPostsInfo()
    }, []);



    const type = () => {
        if (archivedPost == null) {
            return ''
        }
        else if (archivedPost.postType === 'Articles') {
            return 'article'
        } else if (archivedPost.postType === 'Case Studies') {
            return 'case-study'
        }
        else if (archivedPost.postType === 'Photography') {
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
        <article className={styles.bookmarkcard} title={archivedPost?.title}
            onMouseOver={() => setshowmenu(true)} onMouseLeave={() => setshowmenu(false)}
        >
            {user && (showmenu || width < 1020) &&
                <AddToFolderMenu
                    userId={user.uid}
                    bookmarkId={bookmarkId}
                    bookmarkOwnerId={bookmarkOwnerId}
                />}

            <section className={styles.up}>
                <aside className={styles.posttype} >{type()}</aside>
                <img
                    src={archivedPost?.coverImageURL}
                    width={300}
                    height={170}
                    alt="post cover image"
                />
            </section>

            <section className={width < 1020 ? `${styles.bottom} ${styles.menuisopen}` : bottomclass}>
                <h3 title={archivedPost?.title}>{archivedPost?.title?.substring(0, 40)}{(loadingPosts == false && archivedPost?.title.length > 39) && '...'}</h3>
                <div className={styles.other}>
                    <div className={styles.author}>
                        <img
                            src={archivedPost?.authorAvatar}
                            width={30}
                            height={30}
                            alt="post author avatar"
                        />
                        <h6>{archivedPost.authorName}</h6>
                    </div>
                    <Button name={"Read"} icon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />} link={`/post/${type()}/${post.postId}`} type={"type4"} />

                </div>

            </section>
        </article>
    )
}
































export const FolderCard = ({ post }) => {
    return (
        <article className={styles.olderCard}>
            <Link href={`/archive/folder/${post.folderId}`}>
                <div className={styles.docket}>
                    <FontAwesomeIcon icon={faFolder} />
                </div>
                <h5>{post.folderName}</h5>
                <span>{post.bookmarks?.length} posts</span>
            </Link>

        </article>
    )
}

