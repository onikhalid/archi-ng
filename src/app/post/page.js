"use client"

import styles from './post.module.scss'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from "@/utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useSearchParams } from 'next/navigation';

import { SubmitProvider } from '@/utils/ContextandProviders/Providers';
import WhoseandWhichpostH1 from '@/components/Posts/ShowingPosts/Whosepost/whosepostH1Variation';
import MakeArticle from '@/components/Posts/MakingPosts/MakePost/MakeArticle';
import MakeCaseStudy from '@/components/Posts/MakingPosts/MakePost/MakeCaseStudy';
import MakePhoto from '@/components/Posts/MakingPosts/MakePost/MakePhoto';


export default function Home() {
  const [user, loading] = useAuthState(auth);
  const [currentPostToMake, setCurrentPostToMake] = useState("");
  const router = useRouter()
  const searchParams = useSearchParams()
  const postToEdit = searchParams.get('edit')
  const postTypeToEdit = searchParams.get('type')



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







  return (
    <SubmitProvider>
      {
        loading && <h1> Loading...</h1>
      }
      {
        !loading && !user && router.push('/auth')
      }
      {
        (postToEdit === '' || postTypeToEdit === '') && router.push('/post')
      }


      {
        !loading &&
        user &&
        <main className={`content-container`}>



          {/* ///////////////////////////////////////////////////////////// */}
          {/* ///////////////////////////////////////////////////////////// */}
          {/* ///////////////////////////////////////////////////////////// */}
          {/* /////////////////     NEW POST HEADER     ////////////////// */}
          {/* ///////////////////////////////////////////////////////////// */}
          {/* ///////////////////////////////////////////////////////////// */}
          {/* ///////////////////////////////////////////////////////////// */}
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




            {/* ///////////////////////////////////////////////////////////// */}
            {/* ///////////////////////////////////////////////////////////// */}
            {/* ///////////////////////////////////////////////////////////// */}
            {/* /////////////////     EDIT POST HEADER     ////////////////// */}
            {/* ///////////////////////////////////////////////////////////// */}
            {/* ///////////////////////////////////////////////////////////// */}
            {/* ///////////////////////////////////////////////////////////// */}
            {(postToEdit || postTypeToEdit) !== null && <>
              <h4>Edit your</h4>
              <h1>{postTypeToEdit === 'Case Studies' ? 'Case Study' : 'Article'}</h1>
            </>
            }




          </header>


          {/* //////////////////////////////////// */}
          {/* /////////   MAKE NEW POST  ///////// */}
          {/* //////////////////////////////////// */}
          {(currentPostToMake === "an article" && (postTypeToEdit === null)) && <MakeArticle/>}
          {(currentPostToMake === "case study" && (postTypeToEdit === null)) && <MakeCaseStudy />}
          {(currentPostToMake === "a photo" && (postTypeToEdit === null)) && <MakePhoto />}
          
          {/* //////////////////////////////////// */}
          {/* ///////////   EDIT POST   ////////// */}
          {/* //////////////////////////////////// */}
          {postTypeToEdit === "Articles" && <MakeArticle postToEditId={postToEdit} />}
          {postTypeToEdit === "Case Studies" && <MakeCaseStudy postToEditId={postToEdit} />}

        </main>
      }

    </SubmitProvider>

  )
}
