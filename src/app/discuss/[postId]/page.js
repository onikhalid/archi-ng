"use client"

import styles from './discusspage.module.scss'
import { useForm } from "react-hook-form";
import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { UserContext } from '@/utils/ContextandProviders/Contexts';
import { useWindowWidth } from "@/utils/Hooks/ResponsiveHook";

import Link from "next/link";
import { toast } from 'react-toastify';

import { db } from "@/utils/firebase";
import { collection, getDocs, doc, query, where, onSnapshot, updateDoc, arrayUnion, addDoc, orderBy } from "firebase/firestore";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faComment, faEye, faHeart, faPenToSquare, faTrashAlt, faUsers } from "@fortawesome/free-solid-svg-icons";

import { addBookmark, deleteBookmark } from "@/functions/Bookmark";
import { deletePost } from "@/functions/Delete";
import { formatDate, categorizeDate } from "@/functions/Formatting";
import Threads from '@/components/Posts/ShowingPosts/PostCards/Discussions/threads';
import ContributionCard from '@/components/Posts/ShowingPosts/PostCards/Discussions/ContributionCard';









export default function Page({ params }) {
  const { postId } = params
  const { userData, setUserData, authenticatedUser } = useContext(UserContext);

  const width = useWindowWidth()
  const [postData, setPostData] = useState(null)
  const [loadingpost, setloadingpost] = useState(true);
  const [showThreads, setShowThreads] = useState(null);
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  const contributionRef = useRef(null)
  const [contributions, setContributions] = useState(null)






  /////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////
  ///////////////                                                 /////////////////
  ///////////////            INITIAL CONTRIBUTIONS                /////////////////
  ///////////////                                                 /////////////////
  /////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////

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

  }, [postId])









  /////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////
  ///////////////                                                 /////////////////
  ///////////////           SCROLL DOWN CONTRIBUTIONS             /////////////////
  ///////////////                                                 /////////////////
  /////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (contributionRef.current) {
      const { scrollTop, scrollHeight } = contributionRef.current;
      const desiredScrollTop = scrollHeight - contributionRef.current.clientHeight;

      contributionRef.current.scrollTo({
        top: desiredScrollTop,
        behavior: "smooth"
      });

    }
    return () => { };
  }, []);








  /////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////
  ///////////////                                                 /////////////////
  ///////////////            MAKE NEW CONTRIBUTIONS               /////////////////
  ///////////////                                                 /////////////////
  /////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////
  const makeNewContribution = async (data) => {
    if (!userData) {
      toast.error("Login to contribute to discussion", {
        position: "top-center",
        autoClose: 4000
      })
      return
    }
    else {
      setValue("Contribution", "")

      const newContribution = {
        authorName: userData.name,
        authorPhoto: userData.profilePicture,
        authorId: authenticatedUser.uid,
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



      if (postData.contributors?.includes(authenticatedUser?.id)) {
      }
      else {
        const postsCollectionRef = collection(db, `posts`)
        await updateDoc(doc(postsCollectionRef, postId), {
          contributors: arrayUnion(authenticatedUser?.uid)
        });
      }

      const { scrollTop, scrollHeight } = contributionRef.current;
      const desiredScrollTop = scrollHeight - contributionRef.current.clientHeight;

      contributionRef.current.scrollTo({
        top: desiredScrollTop,
        behavior: "smooth"
      });

    }
  }


  const groupedContributions = {};

  contributions?.forEach((contribute) => {
    const category = categorizeDate(contribute.createdAt);

    if (!groupedContributions[category]) {
      groupedContributions[category] = [];
    }

    groupedContributions[category].push(contribute);
  })













  const pageTitle = postData && `${postData.title} - Discussion started by ${postData.authorName} | Archi NG`

  const saveUnsave = () => {
    if (!userData) {
      toast.error("Login to save posts", {
        position: "top-center",
        autoClose: 4000
      })
    } else {
      if (postData.bookmarks?.includes(authenticatedUser?.id)) {
        deleteBookmark(null, authenticatedUser?.id, postId)
      } else {
        const { title, postType, authorId, coverImageURL, authorName, authorAvatar } = postData
        addBookmark(authenticatedUser?.id, postId, title, postType, authorId, coverImageURL, authorName, authorAvatar)
      }
    }
  }

  const threadClasses = () => {
    if (showThreads == null) {
      return `${styles.thread}`
    } else if (showThreads == false) {
      return `${styles.thread} ${styles.close}`

    } else if (showThreads == true) {
      return `${styles.thread} ${styles.open}`

    }
  }














  return (

    <>
      <title>{pageTitle}</title>
      <meta name="description" content={`${postData?.title} - Discussion started by ${postData?.authorName} | Archi NG`} />


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
              <span>
                <small> {width > 720 && "Discussion"} started on <em>{formatDate(postData.createdAt)}</em>  </small>
                {
                  width > 720 &&
                  <Link href={`/profile?id=${postData.authorId}`} title="visit author's profile" className={styles.authorinfo}>
                    <img src={postData.authorAvatar} alt={'author image'} /> {postData.authorName}
                  </Link>
                }
              </span>
            </section>



            <section className={styles.postinfo}>
              {
                authenticatedUser?.id === postData.authorId &&
                <div className={styles.settings}>
                  <Link title="Edit Post" href={`/post?edit=${postData.postId}&type=${postData.postType}`}><FontAwesomeIcon icon={faPenToSquare} /></Link>
                </div>
              }

              <div className={styles.poststats}>
                <article className={postData.bookmarks?.includes(authenticatedUser?.id) ? `${styles.bookmarkedstat}` : `${styles.stat}`} title='bookmark discussion'>
                  <span onClick={saveUnsave}>
                    <FontAwesomeIcon icon={faBookmark} />
                  </span>
                  <h5>{postData.bookmarks ? postData.bookmarks.length : 0}</h5>
                </article>

                <article className={styles.comment} title='contributions'>
                  <FontAwesomeIcon icon={faComment} />
                  <h5>{contributions?.length} </h5>
                </article>

                <article className={styles.comment} title='contibutors'>
                  <FontAwesomeIcon icon={faUsers} />
                  <h5>{postData.contributors ? postData.contributors.length : 0} </h5>
                </article>
              </div>
            </section>
          </header>








          <section className={styles.allContributions} ref={contributionRef}>
            {Object.entries(groupedContributions).map(([date, contributions], index) => (
              <div key={index}>
                <strong>{date}</strong>
                {contributions.map((contribute, innerIndex) => (
                  <ContributionCard key={innerIndex} post={contribute} setShowThreads={setShowThreads} clickable />
                ))}
              </div>
            ))}
          </section>







          <section id="contributions" className={styles.makeContributionSection}>

              <form id='writecontribution' className={styles.writecomment} onSubmit={handleSubmit(makeNewContribution)}>
                <div className={`inputdiv ${styles.inputdiv}`}>
                  <textarea
                    id="contribution" name="Contribution" type="text"
                    placeholder="Contribute to the discussion" rows={2}
                    {...register("Contribution", { required: true })} />
                  {errors.Contribution && <span>You can&apos;t submit an empty contribution</span>}
                </div>

                <button form="writecontribution" type="submit" className={'capsulebutton'}>Contribute</button>
              </form>

          </section>



          {
            <section className={threadClasses()}>

              <Threads setShowThreads={setShowThreads} postId={postId} />

            </section>
          }



        </div>
      }
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
