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
import StartDiscussion from '@/components/Posts/MakingPosts/MakePost/StartDiscussion';
import { doc, getDoc } from 'firebase/firestore';


export default function Home() {
  const [user, loading] = useAuthState(auth);
  const [currentPostToMake, setCurrentPostToMake] = useState("an article");
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
      name: "a photo",
    },
    {
      number: 2,
      name: "an article",
    },
    {
      number: 3,
      name: "a case study",
    },
    {
      number: 4,
      name: "a discuss topic",
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
      else if ((postTypeToEdit !== "Case Studies") && (postTypeToEdit !== "Articles") && (postTypeToEdit !== "Discussions")) {
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
  if (currentPostToMake == "a case study") {
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

  } else if (currentPostToMake == "a discuss topic") {
    pageTitle = `Make Post: Start Discussion | Archi NG`

  } else pageTitle = "Loading Make Post.."











  return (
    <>
      <title>{pageTitle}</title>

      {
        loading && <h3> Loading...</h3>
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
              <h4>Edit {userHasPermToEditPost && userHasPermToEditPost == 'no' ? "someone else's 🙄?" : "your"}</h4>
              {postTypeToEdit === 'Case Studies' && <h1>Case Study</h1>}
              {postTypeToEdit === 'Articles' && <h1>Article</h1>}
              {postTypeToEdit === 'Discussions' && <h1>Discussion</h1> }
            </>
            }
          </header>





          {/* //////////////////////////////////// */}
          {/* /////////   MAKE NEW POST  ///////// */}
          {/* //////////////////////////////////// */}
          {(currentPostToMake === "a photo" && (postTypeToEdit === null)) && <MakePhoto />}
          {(currentPostToMake === "an article" && (postTypeToEdit === null)) && <MakeArticle />}
          {(currentPostToMake === "a case study" && (postTypeToEdit === null)) && <MakeCaseStudy />}
          {(currentPostToMake === "a discuss topic" && (postTypeToEdit === null)) && <StartDiscussion />}

          {/* //////////////////////////////////// */}
          {/* ///////////   EDIT POST   ////////// */}
          {/* //////////////////////////////////// */}
          {userHasPermToEditPost == 'yes' && postTypeToEdit === "Articles" && <MakeArticle postToEditId={postToEdit} setIsWrongFormat={setIsWrongFormat}/>}
          {userHasPermToEditPost == 'yes' && postTypeToEdit === "Case Studies" && <MakeCaseStudy postToEditId={postToEdit} setIsWrongFormat={setIsWrongFormat}/>}
          {userHasPermToEditPost == 'yes' && postTypeToEdit === "Discussions" && <StartDiscussion postToEditId={postToEdit} setIsWrongFormat={setIsWrongFormat}/>}
          {userHasPermToEditPost == 'yes' && postTypeToEdit === "Photography" && <MakePhoto postToEditId={postToEdit} setIsWrongFormat={setIsWrongFormat}/>}




          {/* //////////////////////////////////////////// */}
          {/* /////   NO PERMISSION TO EDIT POST   /////// */}
          {/* //////////////////////////////////////////// */}
          {userHasPermToEditPost == 'no' &&
            <div className='infobox'>
              <h3>
                How did you get here? 😯, this is not your post you can&apos;t edit it
              </h3>
            </div>
          }

        </main>
      }

      {
        isWrongFormat &&
        <div className='infobox'>
          <h3>Wrong post id or post type, double check the url and reload the page</h3>
        </div>
      }
    </>

  )
}
