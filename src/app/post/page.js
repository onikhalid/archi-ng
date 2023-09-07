"use client"

import styles from './post.module.scss'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from "@/utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useSearchParams } from 'next/navigation';

import WhoseandWhichpostH1 from '@/components/Posts/ShowingPosts/Whosepost/whosepostH1Variation';
import MakeArticle from '@/components/Posts/MakingPosts/MakePost/MakeArticle';
import MakeCaseStudy from '@/components/Posts/MakingPosts/MakePost/MakeCaseStudy';
import MakePhoto from '@/components/Posts/MakingPosts/MakePost/MakePhoto';
import { doc, getDoc } from 'firebase/firestore';


export default function Home() {
  const [user, loading] = useAuthState(auth);
  const [currentPostToMake, setCurrentPostToMake] = useState("Article");
  const router = useRouter()
  const searchParams = useSearchParams()
  const postToEdit = searchParams.get('edit')
  const postTypeToEdit = searchParams.get('type')
  const [userHasPermToEditPost, setUserHasPermToEditPost] = useState(null);
  const [isWrongFormat, setIsWrongFormat] = useState(false);



  // handle change to what's displayed to the user about which post they can currently make
  const variation = [
    {
      number: 1,
      name: "an article",
    },
    {
      number: 2,
      name: "case study",
    },
    {
      number: 3,
      name: "a photo",
    }
  ];


  useEffect(() => {
    const storedMakePostState = localStorage.getItem('currentPostToMake');
    if (storedMakePostState) {
      setCurrentPostToMake(storedMakePostState);
    } else setCurrentPostToMake("an article")
  }, []);

  useEffect(() => {
    localStorage.setItem('currentPostToMake', currentPostToMake);
  }, [currentPostToMake]);





  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////
  /////////       CHECK OWNER OF POST TO EDIT     ///////////
  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////



  useEffect(() => {

    const checkPostToEditOwner = async () => {
      if (!user) {
        return
      }
      else if (!postToEdit || !postTypeToEdit) {
        return
      }
      else if ((postTypeToEdit !== "Case Studies") && (postTypeToEdit !== "Articles")) {
        setIsWrongFormat(true)
        return
      }
      else {
        const postRef = doc(db, `posts/${postToEdit}`)
        const postDocSnap = await getDoc(postRef)
        const postData = postDocSnap.data()
        if (user.uid === postData.authorId) {
          setUserHasPermToEditPost('yes')
        }
        else setUserHasPermToEditPost('no')
      }
    }


    checkPostToEditOwner()

  }, [user, postToEdit, postTypeToEdit]);







  ////////////////////////////////////////////////////////////
  /////////                PAGE TITLE              ///////////
  let pageTitle
  if (currentPostToMake == "case study") {
    if ((postToEdit || postTypeToEdit) === null) {
      pageTitle = `Make Post: Case Study | Archi NG`
    } else pageTitle = `Edit Post: ${postTypeToEdit} | Archi NG`

  }
  else if (currentPostToMake == "an article") {
    if ((postToEdit || postTypeToEdit) === null) {
      pageTitle = `Make Post: Article | Archi NG`
    } else pageTitle = `Edit Post: ${postTypeToEdit} | Archi NG`

  } else if (currentPostToMake == "a photo") {
    if ((postToEdit || postTypeToEdit) === null) {
      pageTitle = `Make Post: Photo | Archi NG`
    } else pageTitle = `Edit Post: ${postTypeToEdit} | Archi NG`

  } else pageTitle = "Loading Make Post.."











  return (
    <>
      <title>{pageTitle}</title>

      {
        loading && <h1> Loading...</h1>
      }
      {
        !loading && !user && router.push('/auth?redirect=home')
      }
      {
        (postToEdit === '' || postTypeToEdit === '') && router.push('/post')
      }


      {
        !loading && !isWrongFormat &&
        user &&
        <main className={`content-container`}>



          {/* ///////////////////////////////////////////// */}
          {/* //////////     NEW POST HEADER     ////////// */}
          {/* ///////////////////////////////////////////// */}
          <header className={styles.header}>
            {(postToEdit || postTypeToEdit) === null && <>

              <h4>What are you posting today?</h4>
              <WhoseandWhichpostH1
                variations={variation}
                currentPost={currentPostToMake}
                setCurrentPost={setCurrentPostToMake}
              />
            </>
            }




            {/* ///////////////////////////////////////////// */}
            {/* /////////     EDIT POST HEADER     ////////// */}
            {/* ///////////////////////////////////////////// */}
            {(postToEdit || postTypeToEdit) !== null && <>
              <h4>Edit {userHasPermToEditPost ? "your" : "someone else's 🙄?"}</h4>
              <h1>{postTypeToEdit === 'Case Studies' ? 'Case Study' : 'Article'}</h1>
            </>
            }
          </header>





          {/* //////////////////////////////////// */}
          {/* /////////   MAKE NEW POST  ///////// */}
          {/* //////////////////////////////////// */}
          {(currentPostToMake === "an article" && (postTypeToEdit === null)) && <MakeArticle />}
          {(currentPostToMake === "case study" && (postTypeToEdit === null)) && <MakeCaseStudy />}
          {(currentPostToMake === "a photo" && (postTypeToEdit === null)) && <MakePhoto />}

          {/* //////////////////////////////////// */}
          {/* ///////////   EDIT POST   ////////// */}
          {/* //////////////////////////////////// */}
          {userHasPermToEditPost == 'yes' && postTypeToEdit === "Articles" && <MakeArticle postToEditId={postToEdit} />}
          {userHasPermToEditPost == 'yes' && postTypeToEdit === "Case Studies" && <MakeCaseStudy postToEditId={postToEdit} />}




          {/* //////////////////////////////////////////// */}
          {/* /////   NO PERMISSION TO EDIT POST   /////// */}
          {/* //////////////////////////////////////////// */}
          {userHasPermToEditPost == 'no' &&
            <div className='infobox'>
              <h2>
                How did you get here? 😯, this is not your post you can&apos;t edit it
              </h2>
            </div>
          }

        </main>
      }

      {
        isWrongFormat &&
        <div className='infobox'>
          <h2>Wrong post id or post type, double check the url and reload the page</h2>
        </div>
      }
    </>

  )
}
