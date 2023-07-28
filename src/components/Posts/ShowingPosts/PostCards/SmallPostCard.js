"use client"
import styles from "./SmallPostCard.module.scss"
import { db, auth } from "@/utils/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useLayoutEffect, useState } from "react"
import Link from "next/link"
import PostMenu from "./PostCardMenu/PostMenu"
import Button from "@/components/Button/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faArrowUpRightFromSquare, faTrash, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { useAuthState } from "react-firebase-hooks/auth"
import { useWindowWidth } from "@/utils/Hooks/ResponsiveHook"
import { addBookmark, deleteBookmark } from "@/components/Posts/InteractingWithPosts/Likes and Comments/Bookmark"
import { deleteFolder } from "@/components/Posts/InteractingWithPosts/Likes and Comments/Bookmark"




export const SmallPostCard = ({ post, id }) => {

    const [user, loading] = useAuthState(auth);
    const [postData, setPostData] = useState(null);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [saved, setSaved] = useState(false)
    const [menuOpen, setMenuOpen] = useState(null)


    const { postId, title, postType, authorId, coverImageURL, authorName, authorAvatar } = post || {}



    useLayoutEffect(() => {
        setLoadingPosts(true)

        const checkWhichPost = async () => {
            if (post) {
                setPostData(post)
            } else if (id) {
                const postRef = doc(db, `posts/${id}`)
                const postSnap = await getDoc(postRef)
                const post = postSnap.data()
                setPostData(post)
            }
        }
        setLoadingPosts(false)

        checkWhichPost()
    }, []);



    const type = () => {
        if (postData == null) {
            return ''
        }
        else if (postData?.postType === 'Articles') {
            return 'article'
        } else if (postData?.postType === 'Case Studies') {
            return 'case-study'
        }
        else if (postData?.postType === 'Photography') {
            return 'photo'
        }
    }


    // change icon to show user has bookmarked post
    const bookmarkPost = () => {
        if (!user || user.uid == undefined) {
            toast.error("Sign in to save posts", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 3500,
            });
        } else {
            setSaved(true)
            if (post) {
                addBookmark(user.uid, postId, title, postType, authorId, coverImageURL, authorName, authorAvatar)

            } else if (id) {
                const { postId, title, postType, authorId, coverImageURL, authorName, authorAvatar } = postData || {}
                addBookmark(user.uid, postId, title, postType, authorId, coverImageURL, authorName, authorAvatar)

            }

            setTimeout(() => {
                setSaved(false)
            }, 1500);
        }
    }







    return (
        <>
            {
                post && loadingPosts && <div className="infobox">Loading...</div>
            }


            {!loadingPosts && postData &&
                <article className={styles.smallcard} title={postData.title}>
                    <section className={styles.up}>
                        <aside className={styles.posttype} >{type()}</aside>
                        <img
                            src={postData.coverImageURL}
                            width={300}
                            height={170}
                            alt="post cover image"
                        />
                    </section>

                    <section className={styles.bottom}>
                        <div className={styles.bottomtop}>
                            <h3 title={postData.title}>{postData.title.substring(0, 34)}{(loadingPosts == false && postData.title.length > 35) && '...'}</h3>
                            <PostMenu
                                menuOpen={menuOpen}
                                setOpen={setMenuOpen}
                                post={post || postData}
                                smallpost
                            />
                        </div>
                        <div className={styles.other}>
                            <Button name={saved ? 'Saved' : 'Save'} icon={saved ? <FontAwesomeIcon icon={faCircleCheck} /> : <FontAwesomeIcon icon={faFolder} />} link={bookmarkPost} type={"tertiary"} />
                            <Button name={"Read"} icon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />} link={`/post/${type()}/${postData.postId}`} type={"type4"} />
                        </div>

                    </section>
                </article>
            }

        </>

    )
}













/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
////////////////       FOLDER CARD       ////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////


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
