"use client"

import styles from './discusspage.module.scss'
import { useEffect, useLayoutEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from 'next/navigation';
import { useWindowWidth } from "@/utils/Hooks/ResponsiveHook";
import Image from "next/image";
import Link from "next/link";
import { toast } from 'react-toastify';

import { auth, db } from "@/utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, getDocs, doc, query, where, onSnapshot, updateDoc, arrayUnion, addDoc } from "firebase/firestore";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faComment, faEye, faHeart, faPenToSquare, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { CommentCard } from "@/components/Posts/InteractingWithPosts/Likes and Comments/CommentCard";
import { FollowersFollowingandLikesList } from "@/components/Profile/Followers,FollowingandLikesList";

import { addLike, removeLike } from "@/functions/Likes";
import { addBookmark, deleteBookmark } from "@/functions/Bookmark";
import { deletePost } from "@/functions/Delete";
import { formatDate } from "@/functions/Formatting";




export default function Page({ params }) {
  const { postId } = params
  const router = useRouter()
  const width = useWindowWidth()
  const [user, loading] = useAuthState(auth);
  const [postData, setPostData] = useState(null)
  const [loadingpost, setloadingpost] = useState(true);
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();



  useEffect(() => {


    const getPost = async () => {
      try {
        const postDocRef = doc(db, `posts/${postId}`);

        onSnapshot(postDocRef, async (snapshot) => {
          const data = snapshot.data()
          if (data === undefined) {
            setPostData("Doesn't Exists")
            
          } else {
            setPostData(data)
            
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

  }, [postId, user])







  // const likeUnlike = () => {
  //   if (!user) {
  //     toast.error("Login to like posts", {
  //       position: "top-center",
  //       autoClose: 4000
  //     })
  //     return
  //   } else {
  //     if (postData.likes?.includes(user.uid)) {
  //       removeLike(postId, user.uid)
  //     } else {
  //       addLike(postId, user.uid)
  //     }
  //   }
  // }

  const saveUnsave = () => {
    if (!user) {
      toast.error("Login to save posts", {
        position: "top-center",
        autoClose: 4000
      })
    } else {
      if (postData.bookmarks?.includes(user.uid)) {
        deleteBookmark(null, user.uid, postId)
      } else {
        const { title, postType, authorId, coverImageURL, authorName, authorAvatar } = postData
        addBookmark(user.uid, postId, title, postType, authorId, coverImageURL, authorName, authorAvatar)
      }
    }
  }





  //////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////
  /////////////////       COMMENTS      ////////////////////////
  //////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////
  const makeNewContribution = async (data) => {
    if (!user) {
      toast.error("Login to contribute", {
        position: "top-center",
        autoClose: 4000
      })
      return
    }
    else {
      const newComment = {
        authorName: user.displayName,
        authorPhoto: user.photoURL,
        authorId: user.uid,
        createdAt: new Date(),
        text: data.Comment,
        postId: postId,
      }

      const postDocRef = doc(db, `posts/${postId}`)
      const newPostRef = await addDoc(postCollectionRef, postData);

      setValue("Comment", "")
    }
  }




  const pageTitle = postData && `${postData.title} - case study by ${postData.authorName} | Archi NG`












  return (

    <>
      <title>{pageTitle}</title>

      <div className={styles.casestudy}>

        {(!loadingpost && ! postData || postData == "Doesn't Exists") &&
          <div className='infobox'>
            <h3>Poor internet connection or Post doesn&apos;t exist</h3>
            <small>Wait a while, this error might automatically be rectified. If nothing happens after 10 seconds, Check your internet connection and try again</small>
          </div>
        }
        {/* {(!loadingpost && postData == "Doesn't Exists") &&
          <div className='infobox'>
            <h3> Post doesn&apos;t exist</h3>
          </div>
        } */}
        {loadingpost &&
          <div className='infobox'>
            <h2>Loading...</h2>
          </div>
        }





        {
          !loadingpost && postData && postData !== "Doesn't Exists" &&
          <div className={`content-container ${styles.container}`}>
            <header >
              <div className={styles.title}>
                <h2>{postData.title}</h2>
                {width > 719 && <span> Article by {postData.authorName}, <em>{formatDate(postData.createdAt)}</em></span>}
              </div>
              {
                user?.uid === postData.authorId &&
                <div className={styles.settings}>
                  <Link title="Edit Post" href={`/post?edit=${postData.postId}&type=${postData.postType}`}><FontAwesomeIcon icon={faPenToSquare} /></Link>
                  <span title="Delete Post" onClick={() => deletePost(postData.postId, postData.postContent, postData.coverImageURL)}> <FontAwesomeIcon icon={faTrashAlt} /> </span>
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

                  <section className={styles.otherinfo}>

                    <Link href={`/profile?id=${postData.authorId}`} title="visit author's profile" className={styles.authorinfo}>
                      <img src={postData.authorAvatar} alt={'author image'} />
                      <h6 title={postData.authorName}>{postData.authorName}</h6>
                    </Link>
                  </section>
                </div>



                {/* //////////////////////////////////////// */}
                {/* ///////////       STATS         //////// */}
                {/* //////////////////////////////////////// */}
                <div className={styles.poststats}>
                  {/* <article className={postData.likes?.includes(user?.uid) ? ` ${styles.likedstat}` : `${styles.stat}`}>
                    <span>
                      <h5>{postData.likes ? postData.likes.length : 0} <span>Likes</span></h5>
                      <FollowersFollowingandLikesList postId={postId} />
                    </span>

                    <span onClick={likeUnlike}>
                      <FontAwesomeIcon icon={faHeart} />
                    </span>
                  </article> */}

                  <article className={postData.bookmarks?.includes(user?.uid) ? `${styles.bookmarkedstat}` : `${styles.stat}`}>
                    <h5>{postData.bookmarks ? postData.bookmarks.length : 0} <span>Saves</span></h5>
                    <span onClick={saveUnsave}>
                      <FontAwesomeIcon icon={faBookmark} />
                    </span>

                  </article>

                  <article className={styles.comment}>
                    <h5>{postData.comments ? postData.comments.length : 0} <span>Contributions</span></h5>
                    <Link href={'#contributions'}><FontAwesomeIcon icon={faComment} /></Link>
                  </article>


                </div>
              </div>

            </section>




            <section id="contributions" className={styles.commentsection}>
              <h2>Contributions</h2>

              {user &&
                <form id='writecontribution' className={styles.writecomment} onSubmit={handleSubmit(makeNewContribution)}>

                  <div className={`inputdiv ${styles.inputdiv}`}>
                    <textarea
                      id="Comment" name="Comment" type="text"
                      placeholder="Write a Remark" rows={5}
                      {...register("Comment", { required: true })} />
                    {errors.Comment && <span>You can&apos;t submit an empty remark</span>}
                  </div>

                  <div className={styles.writer}>
                    <button form="writecontribution" type="submit" className={styles.writecommentButton}>Post Remark</button>
                    <span><Image src={user.photoURL} alt="user photo" height={28} width={28} /> {user?.displayName}</span>
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
  const articlesQuery = query(postsCollection, where('postType', '==', 'Articles'));
  const articlesDocs = await getDocs(articlesQuery);

  return articlesDocs.docs.map((doc) => ({
    postId: doc.data().postId,
  }));
}
