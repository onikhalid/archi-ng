"use client"

import styles from './discusspage.module.scss'
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from 'next/navigation';
import { useWindowWidth } from "@/utils/Hooks/ResponsiveHook";
import Image from "next/image";
import Link from "next/link";
import { toast } from 'react-toastify';

import { auth, db } from "@/utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, getDocs, doc, query, where, onSnapshot, updateDoc, arrayUnion, addDoc, orderBy } from "firebase/firestore";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faComment, faEye, faHeart, faPenToSquare, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { CommentCard } from "@/components/Posts/InteractingWithPosts/Likes and Comments/CommentCard";
import { FollowersFollowingandLikesList } from "@/components/Profile/Followers,FollowingandLikesList";

import { addLike, removeLike } from "@/functions/Likes";
import { addBookmark, deleteBookmark } from "@/functions/Bookmark";
import { deletePost } from "@/functions/Delete";
import { formatDate } from "@/functions/Formatting";
import ContributionCard from '@/components/Posts/ShowingPosts/PostCards/Discussions/ContributionCard';
import { UserContext } from '@/utils/ContextandProviders/Contexts';



export default function Page({ params }) {
  const { postId } = params
  const router = useRouter()
  const width = useWindowWidth()
  const [user, loading] = useAuthState(auth);
  const { userData, setUserData } = useContext(UserContext);
  const [postData, setPostData] = useState(null)
  const [contributions, setContributions] = useState(null)
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



    const getContributions = async () => {
      try {
        const contributionsCollectionRef = collection(db, "contributions");
        const contributionsDocsRef = query(contributionsCollectionRef, where('postId', '==', postId), where('parentContributionId', '==', null), orderBy('createdAt'));


        onSnapshot(contributionsDocsRef, async (snapshot) => {
          const data = []
          snapshot.docs.forEach(contribute => {
            data.push(contribute.data())
          });

          setContributions(data)

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
    getContributions()


    setloadingpost(false)

  }, [postId, user])









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
      const newContribution = {
        authorName: user.displayName,
        authorPhoto: user.photoURL,
        authorId: user.uid,
        authorUsername: userData.username,
        createdAt: new Date(),
        text: data.Contribution,
        postId: postId,
        parentContributionId: null
      }

      const contributionsCollectionRef = collection(db, `contributions`)
      const newPostRef = await addDoc(contributionsCollectionRef, newContribution);
      const contributeId = newPostRef.id
      await updateDoc(doc(contributionsCollectionRef, newPostRef.id), {
        contributeId: contributeId
      });

      setValue("Contribution", "")
    }
  }




  const pageTitle = postData && `${postData.title} - Discussion started by ${postData.authorName} | Archi NG`












  return (

    <>
      <title>{pageTitle}</title>

      <div className={styles.casestudy}>

        {(!loadingpost && !postData || postData == "Doesn't Exists") &&
          <div className='infobox'>
            <h3>Poor internet connection or Post doesn&apos;t exist</h3>
            <small>Wait a while, this error might automatically be rectified. If nothing happens after 10 seconds, Check your internet connection and try again</small>
          </div>
        }

        {loadingpost &&
          <div className='infobox'>
            <h3>Loading...</h3>
          </div>
        }





        {
          !loadingpost && postData && postData !== "Doesn't Exists" &&
          <div className={`content-container ${styles.container}`}>
            <header >
              <section className={styles.title}>
                <h3>{postData.title}</h3>
                <small> Discussion started on <em>{formatDate(postData.createdAt)}</em>
                  <Link href={`/profile?id=${postData.authorId}`} title="visit author's profile" className={styles.authorinfo}>
                    <img src={postData.authorAvatar} alt={'author image'} /> {postData.authorName}
                  </Link>
                </small>
              </section>




              <section className={styles.postinfo}>
                {
                  user?.uid === postData.authorId &&
                  <div className={styles.settings}>
                    <Link title="Edit Post" href={`/post?edit=${postData.postId}&type=${postData.postType}`}><FontAwesomeIcon icon={faPenToSquare} /></Link>
                    <span title="Delete Post" onClick={() => deletePost(postData.postId, postData.postContent, postData.coverImageURL)}> <FontAwesomeIcon icon={faTrashAlt} /> </span>
                  </div>
                }


                <div className={styles.poststats}>
                  <article className={postData.bookmarks?.includes(user?.uid) ? `${styles.bookmarkedstat}` : `${styles.stat}`} title='bookmark discussion'>
                    <h5>{postData.bookmarks ? postData.bookmarks.length : 0}</h5>
                    <span onClick={saveUnsave}>
                      <FontAwesomeIcon icon={faBookmark} />
                    </span>
                  </article>

                  <article className={styles.comment} title='contributions'>
                    <h5>{postData.comments ? postData.comments.length : 0} </h5>
                    <FontAwesomeIcon icon={faComment} />
                  </article>

                  <article className={styles.comment} title='contibutors'>
                    <h5>{postData.comments ? postData.comments.length : 0} </h5>
                    <FontAwesomeIcon icon={faComment} />
                  </article>
                </div>


              </section>


            </header>








            <section className={styles.allContributions}>
              {
                contributions?.map((contribute, index) => {
                  return <ContributionCard key={index} post={contribute} />
                })
              }
            </section>




            <section id="contributions" className={styles.makeContributionSection}>

              {user &&
                <form id='writecontribution' className={styles.writecomment} onSubmit={handleSubmit(makeNewContribution)}>

                  <div className={`inputdiv ${styles.inputdiv}`}>
                    <textarea
                      id="contribution" name="Contribution" type="text"
                      placeholder="Contribute to the discussion" rows={4}
                      {...register("Contribution", { required: true })} />
                    {errors.Comment && <span>You can&apos;t submit an empty contribution</span>}
                  </div>

                  {/* <div className={styles.writer}> */}
                    <button form="writecontribution" type="submit" className={styles.writecommentButton}>Post Remark</button>
                    <button form="writecontribution" type="submit" className={'capsulebutton'}>Post Remark</button>
                    {/* <div>Contributing as <span><Image src={user.photoURL} alt="user photo" height={28} width={28} /> {user?.displayName}</span></div> */}
                  {/* </div> */}


                </form>
              }

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
