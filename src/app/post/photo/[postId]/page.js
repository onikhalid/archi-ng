"use client"

"use client"
import styles from "./articlepage.module.scss"
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from 'next/navigation';
import { useWindowWidth } from "@/utils/Hooks/ResponsiveHook";
import Image from "next/image";
import Link from "next/link";

import { db } from "@/utils/firebase";
import { collection, getDocs, doc, query, where, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faComment, faEye, faHeart, faPenToSquare, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { CommentCard } from "@/components/Posts/InteractingWithPosts/Likes and Comments/CommentCard";
import { FollowersFollowingandLikesList } from "@/components/Profile/Followers,FollowingandLikesList";
import { addLike, removeLike } from "@/functions/Likes";
import { addBookmark, deleteBookmark } from "@/functions/Bookmark";
import { deletePost } from "@/functions/Delete";
import { formatDate } from "@/functions/Formatting";
import { UserContext } from "@/utils/ContextandProviders/Contexts";




export default function Page({ params }) {
    const { postId } = params
    const router = useRouter()
    const width = useWindowWidth()
    const { userData, setUserData, authenticatedUser } = useContext(UserContext);

    const [postData, setPostData] = useState(null)
    const [loadingpost, setloadingpost] = useState(true);
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();



    useEffect(() => {


        const getPost = async () => {
            try {
                const postDocRef = doc(db, `posts/${postId}`);

                onSnapshot(postDocRef, async (snapshot) => {
                    const data = snapshot.data()

                    if (data) {
                        if (data.postType === "Articles") {
                            setPostData(data)

                        } else {
                            setPostData("exists but not an article")
                        }



                        if (authenticatedUser) {
                            await updateDoc(postDocRef, { reads: arrayUnion(authenticatedUser.uid) })
                        }

                    }

                })

            }

            catch (error) {
                if (error.code === "unavailable") {
                    toast.error("Refresh the page, an errror occured while fetching data", {
                        position: "top-center",
                        autoClose: 5000
                    })
                }
                if (error.code === "client-offline") {
                    toast.error("Seems like you are offline, connect to the internet and try again")
                }
                if (error.code === 3) {
                    toast.error("Seems like you are offline, connect to the internet and try again")
                }
            }
        }

        getPost()


        setloadingpost(false)

    }, [postId, authenticatedUser])











    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    ///////////////       LIKE AND BOOKMARK      /////////////////
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    const likeUnlike = () => {
        if (!authenticatedUser) {
            toast.error("Login to like posts", {
                position: "top-center",
                autoClose: 4000
            })
            return
        } else {
            if (postData.likes?.includes(userData.id)) {
                removeLike(postId, userData.id)
            } else {
                addLike(postId, userData.id)
            }
        }
    }

    const saveUnsave = () => {
        if (!authenticatedUser) {
            toast.error("Login to save posts", {
                position: "top-center",
                autoClose: 4000
            })
        } else {
            if (postData.bookmarks?.includes(authenticatedUser.uid)) {
                deleteBookmark(null, authenticatedUser.uid, postId)
            } else {
                const { title, postType, authorId, coverImageURL, authorName, authorAvatar } = postData
                addBookmark(authenticatedUser.uid, postId, title, postType, authorId, coverImageURL, authorName, authorAvatar)
            }
        }
    }





    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    /////////////////       COMMENTS      ////////////////////////
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    const makeNewComment = async (data) => {
        if (!authenticatedUser) {
            toast.error("Login to make remark", {
                position: "top-center",
                autoClose: 4000
            })
            return
        }
        else {
            const newComment = {
                authorName: userData.name,
                authorPhoto: userData.profilePicture,
                authorId: userData.id,
                createdAt: new Date(),
                text: data.Comment
            }
            const postDocRef = doc(db, `posts/${postId}`)

            await updateDoc(postDocRef, { comments: arrayUnion(newComment) });
            setValue("Comment", "")
        }
    }






    const content = postData?.postContent
    const pageTitle = postData && `${postData.title} - Article by ${postData.authorName} | Archi NG`



    const delpost = () => {
        deletePost(postData.postId, postData.postContent, postData.coverImageURL)
        router.push('/')
    }








    return (

        <>
            <title>{pageTitle}</title>

            <div className={styles.casestudy}>

                {(!loadingpost && !postData) &&
                    <div className='infobox'>
                        <h3>Bad internet connection or Post doesn&apos;t exist</h3>
                    </div>
                }
                {loadingpost &&
                    <div className='infobox'>
                        <h3>Loading...</h3>
                    </div>
                }





                {
                    !loadingpost && postData &&
                    <div className={`content-container ${styles.container}`}>
                        <header >
                            <div className={styles.title}>
                                <h1>{postData.title}</h1>
                                {width > 719 && <span> Article by {postData.authorName}, <em>{formatDate(postData.createdAt)}</em></span>}
                            </div>
                            {
                                userData?.id === postData.authorId &&
                                <div className={styles.settings}>
                                    <Link title="Edit Post" href={`/post?edit=${postData.postId}&type=${postData.postType}`}><FontAwesomeIcon icon={faPenToSquare} /></Link>
                                    <span title="Delete Post" onClick={delpost}> <FontAwesomeIcon icon={faTrashAlt} /> </span>
                                </div>
                            }
                        </header>



                        <section className={styles.postinfosection}>
                            <div className={styles.coverimage}>
                                <Image
                                    src={postData.coverImageURL}
                                    alt={`case study post cover image`}
                                    height={900}
                                    width={1600}
                                    layout="responsive"
                                    placeholder="empty"
                                />
                            </div>

                            <div className={styles.postinfo}>
                                <div className={styles.basicinfo}>
                                    <section className={styles.desc}>
                                        <h6><span>time to read:</span><br />  {postData.timeToRead} mins</h6>
                                        <h6><span>desc:</span> <br />  {postData.desc}</h6>
                                    </section>


                                    <section className={styles.otherinfo}>
                                        <div className={styles.postags}>
                                            {width > 1279 && <h6>Tags:</h6>}

                                            {
                                                postData.tags.map((tag, index) => {
                                                    return (
                                                        <Link title='Explore tag' key={index} href={`/search?q=${tag}`}><em>{tag.toUpperCase()},</em></Link>
                                                    )
                                                })
                                            }
                                        </div>
                                        <div className={styles.authorandtime}>
                                            <Link href={`/profile/${postData.authorUsername}`} title="visit author's profile" className={styles.authorinfo}>
                                                <img src={postData.authorAvatar} alt={'author image'} />
                                                <h6 title={postData.authorName}>{postData.authorName}</h6>
                                            </Link>
                                        </div>
                                    </section>
                                </div>



                                {/* //////////////////////////////////////// */}
                                {/* ///////////       STATS         //////// */}
                                {/* //////////////////////////////////////// */}
                                <div className={styles.poststats}>
                                    <article className={postData.likes?.includes(userData?.id) ? ` ${styles.likedstat}` : `${styles.stat}`}>
                                        <span>
                                            <h5>{postData.likes ? postData.likes.length : 0} <span>Likes</span></h5>
                                            <FollowersFollowingandLikesList postId={postId} />
                                        </span>

                                        <span onClick={likeUnlike}>
                                            <FontAwesomeIcon icon={faHeart} />
                                        </span>
                                    </article>

                                    <article className={postData.bookmarks?.includes(userData?.id) ? `${styles.bookmarkedstat}` : `${styles.stat}`}>
                                        <h5>{postData.bookmarks ? postData.bookmarks.length : 0} <span>Saves</span></h5>
                                        <span onClick={saveUnsave}>
                                            <FontAwesomeIcon icon={faBookmark} />
                                        </span>

                                    </article>

                                    <article className={styles.comment}>
                                        <h5>{postData.comments ? postData.comments.length : 0} <span>Remarks</span></h5>
                                        <Link href={'#remarks'}><FontAwesomeIcon icon={faComment} /></Link>
                                    </article>

                                    {
                                        width > 1279 &&
                                        <article className={styles.reads}>
                                            <h5>{postData.reads ? postData.reads.length : 0} <span>Reads</span></h5>
                                            <FontAwesomeIcon icon={faEye} />
                                        </article>
                                    }
                                </div>
                            </div>

                        </section>


                        <main dangerouslySetInnerHTML={{ __html: content }} />


                        <section id="remarks" className={styles.commentsection}>
                            <h2>Remarks</h2>

                            {authenticatedUser &&
                                <form id='writecomment' className={styles.writecomment} onSubmit={handleSubmit(makeNewComment)}>

                                    <div className={`inputdiv ${styles.inputdiv}`}>
                                        <textarea
                                            id="Comment" name="Comment" type="text"
                                            placeholder="Write a Remark" rows={5}
                                            {...register("Comment", { required: true })} />
                                        {errors.Comment && <span>You can&apos;t submit an empty remark</span>}
                                    </div>

                                    <div className={styles.writer}>
                                        <button form="writecomment" type="submit" className={styles.writecommentButton}>Post Remark</button>
                                        <span><img src={userData.profilePicture} alt="user photo" height={28} width={28} /> {userData?.name}</span>
                                    </div>


                                </form>
                            }

                            <div className={styles.comments}>
                                {(postData.comments && postData.comments.length > 0) &&
                                    [...postData.comments]?.reverse().map((comment, index) => {
                                        return <CommentCard key={index} comment={comment} postId={postData.postId} />
                                    })
                                }

                                {(!postData.comments || postData.comments.length < 1) && <h6>No remarks yet, Be the first to post a remark</h6>
                                }
                            </div>
                        </section>
                    </div>
                }
            </div>


        </>
    )
}










export const dynamicParams = false;

export async function generateStaticParams() {
    const postsCollection = collection(db, 'posts');
    const articlesQuery = query(postsCollection, where('postType', '==', 'Photography'));
    const articlesDocs = await getDocs(articlesQuery);

    return articlesDocs.docs.map((doc) => ({
        postId: doc.data().postId,
    }));
}
