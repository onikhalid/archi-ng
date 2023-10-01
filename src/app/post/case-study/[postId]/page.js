"use client"
import styles from "./casestudypage.module.scss"
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/utils/ContextandProviders/Contexts";
import { useRouter } from 'next/navigation';
import { useWindowWidth } from "@/utils/Hooks/ResponsiveHook";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";

import { auth, db } from "@/utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, getDocs, doc, query, where, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faComment, faEye, faHeart, faPenToSquare, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { CommentCard } from "@/components/Posts/InteractingWithPosts/Likes and Comments/CommentCard";
import { FollowersFollowingandLikesList } from "@/components/Profile/Followers,FollowingandLikesList";
import { addLike, removeLike } from "@/functions/Likes";
import { addBookmark, deleteBookmark } from "@/functions/Bookmark";
import { formatDate } from "@/functions/Formatting";
import { deletePost } from "@/functions/Delete";

import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/styles.css";






export default function Page({ params }) {
    const { postId } = params
    const router = useRouter()
    const width = useWindowWidth()
    const { userData, setUserData, authenticatedUser } = useContext(UserContext);

    const [postData, setPostData] = useState(null)
    const [loadingpost, setloadingpost] = useState(true);
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();


    const [galleryImages, setGalleryImages] = useState([]);
    const [lightHouseOpen, setLightHouseOpen] = useState(false);


    const gallerySlides = galleryImages?.map((photo) => {
        const width = 4000;
        const height = 2500;
        const breakpoints = [4320, 2160, 1080, 640, 384, 256, 128];

        return {
            src: photo,
            width,
            height,
            srcSet: breakpoints.map((breakpoint) => {
                const breakpointHeight = Math.round((height / width) * breakpoint);
                return {
                    src: photo,
                    width: breakpoint,
                    height: breakpointHeight,
                };
            }),
        };
    });






    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    ///////////////      GET POST DATA      //////////////////////
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////

    useEffect(() => {

        const getPost = async () => {
            try {
                const postDocRef = doc(db, `posts/${postId}`);

                onSnapshot(postDocRef, async (snapshot) => {
                    const data = snapshot.data()


                    if (data) {
                        setGalleryImages(data.allImages)

                        if (data.postType === "Case Studies") {
                            setPostData(data)
                        } else { setPostData("exists but not a case study") }


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
                if (error.code == "client-offline") {
                    toast.error("Seems like you are offline, connect to the internet and try again")
                }
                if (error.code === "failed-precondition") {
                    toast.error("Poor internet connection")
                }
                else if (error.message.includes('Backend didn\'t respond' || "[code=unavailable]")) {
                    toast.error("There appears to be a problem with your connection", {
                        position: "top-center"
                    })
                }
                else if (error.code === "auth/network-request-failed" || "unavailable") {
                    toast.error("There appears to be a problem with your connection", {
                        position: "top-center"
                    })
                }
            }
        }

        getPost()
        setloadingpost(false)

    }, [postId, authenticatedUser])










    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    ///////////////      LIKE/BOOKMARK      //////////////////////
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





    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    /////////////////       DELETE POST      /////////////////////
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    const delPost = async () => {
        await deletePost(postData.postId, postData.postContent, postData.coverImageURL)
        router.push('/')
    }









    const content = postData?.postContent
    const pageTitle = postData && `${lightHouseOpen ? `Gallery of` : ``} ${postData.title} - Case Study by ${postData.authorName} | Archi NG`










    return (

        <>
            <title>{pageTitle}</title>
            <meta name="description" content={postData?.title} />
            <meta name="description" content={`${postData?.title} - Case Study by ${postData?.authorName} | Archi NG`} />


            <div className={styles.casestudy}>

                {(!loadingpost && !postData) &&
                    <div className='infobox'>
                        <h3>Bad internet connection or Post doesn&apos;t exist</h3>
                        <small>If this doesn&apos; clear with 10 seconds, check your internet connection and try again</small>
                    </div>
                }
                {loadingpost &&
                    <div className='infobox'>
                        <h3>Loading...</h3>
                    </div>
                }



                {
                    !loadingpost && postData &&

                    <>

                        {
                            postData == 'exists but not a case study' &&
                            <div className='infobox'>
                                <h3>This post is not a case study</h3>
                            </div>
                        }
                        {
                            postData !== 'exists but not a case study' &&

                            <div className={`content-container ${styles.container}`}>
                                <header >
                                    <div className={styles.title}>
                                        <h1>{postData.title}</h1>
                                        {width > 719 && <span> Case Study by {postData.authorName}, <em>{formatDate(postData.createdAt)}</em></span>}
                                    </div>
                                    {
                                        userData?.id === postData.authorId &&
                                        <div className={styles.settings}>
                                            <Link title="Edit Post" href={`/post?edit=${postData.postId}&type=${postData.postType}`}><FontAwesomeIcon icon={faPenToSquare} /></Link>
                                            <span title="Delete Post" onClick={delPost}> <FontAwesomeIcon icon={faTrashAlt} /> </span>
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
                                                <h6><span>architect:</span><br />  {postData.architect}</h6>
                                                <h6><span>year:</span> <br />  {postData.year}</h6>
                                                <h6><span>location:</span> <br />  {postData.location?.join(', ')}</h6>
                                                <h6><span>typology:</span> <br />  {postData.typology}</h6>
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




                                <section className={styles.gallery}>
                                    <h2>Gallery</h2>
                                    <div className={styles.previewcontainer}>
                                        {
                                            gallerySlides.slice(0, 5).map((image, index) => {

                                                return (
                                                    <img className={styles.previewgalleryimage} src={image.src} key={index} />

                                                )
                                            })
                                        }
                                        {
                                            gallerySlides.length > 5 &&
                                            <button className={styles.previewmore} onClick={() => setLightHouseOpen(true)} title="open gallery">
                                                +{gallerySlides.length - 5}
                                            </button>
                                        }
                                    </div>

                                    <button className={styles.openlightboxbutton} onClick={() => setLightHouseOpen(true)} >See The Full Gallery</button>
                                    <Lightbox
                                        open={lightHouseOpen}
                                        close={() => setLightHouseOpen(false)}
                                        slides={gallerySlides}
                                        plugins={[Captions, Fullscreen, Slideshow, Thumbnails, Video, Zoom, Counter]}
                                        carousel={{ finite: true }}
                                    />

                                    {/* <PhotoAlbum layout="rows" photos={gallerypreviewImages} columns={4}/>; */}
                                </section>




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
                                                <span><img src={userData?.profilePicture} alt="user photo" height={28} width={28} /> {userData?.name}</span>
                                            </div>


                                        </form>
                                    }

                                    <div className={styles.comments}>
                                        {(postData.comments && postData.comments.length > 0) &&
                                            [...postData.comments]?.reverse().map((comment, index) => {
                                                return <CommentCard key={index} comment={comment} postId={postData.postId} />
                                            })
                                        }

                                        {(!postData.comments || postData.comments.length < 1) &&
                                            <h6>No remarks yet, Be the first to post a remark</h6>
                                        }
                                    </div>
                                </section>
                            </div>
                        }

                    </>

                }
            </div>
        </>
    )
}







export const dynamicParams = false;
export async function generateStaticParams() {
    const postsCollection = collection(db, 'posts');
    const StudiesQuery = query(postsCollection, where('postType', '==', 'Case Studies'));
    const StudiesDocs = await getDocs(StudiesQuery);

    return StudiesDocs.docs.map((doc) => ({
        postId: doc.data().postId,
    }));
}




