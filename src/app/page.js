"use client"

import styles from './page.module.scss'
import { useState, useEffect } from 'react';

import { auth, db } from '@/utils/firebase';
import { collection, onSnapshot, orderBy, query, where, getDocs, limit, startAfter } from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth';
import WhoseandWhichpost from '@/components/Posts/ShowingPosts/Whosepost/whosepost';
import WhoseandWhichpostH1 from '@/components/Posts/ShowingPosts/Whosepost/whosepostH1Variation';
import PostSkeleton from "@/components/Posts/ShowingPosts/PostCards/Skeleton/PostSkeleton"
import ArticleCard from '@/components/Posts/ShowingPosts/PostCards/Article';
import CaseStudyCard from '@/components/Posts/ShowingPosts/PostCards/Case Study';
import PhotoCard from '@/components/Posts/ShowingPosts/PostCards/Photo';
import Button from '@/components/Button/button';
import { toast } from 'react-toastify';





export default function Home() {
  const [user, loading] = useAuthState(auth);
  const [currentPost, setCurrentPost] = useState("Articles");
  const [currentwhosePost, setCurrentWhosePost] = useState("Feed");
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [followedUserIds, setfollowedUserIds] = useState([]);


  /////////////////////////////////////////////////
  /////////    POST TYPE VARIATIONS    ////////////
  ////////////////////////////////////////////////
  const variations = [
    {
      number: 1,
      name: "Articles",
    },
    {
      number: 2,
      name: "Case Studies",
    },
    {
      number: 3,
      name: "Photography",
    }
  ];

  ////////////////////////////////////////////////////////////////
  ////////   REMEMBER LAST SELECTED POST VARIATION   ////////////
  //////////////////////////////////////////////////////////////
  useEffect(() => {
    const storedPostState = localStorage.getItem('currentpoststate');
    if (storedPostState) {
      setCurrentPost(storedPostState);
    } else setCurrentPost("Articles")
  }, []);

  useEffect(() => {
    localStorage.setItem('currentpoststate', currentPost);

  }, [currentPost]);



  /////////////////////////////////////////////////
  /////////   WHOSE POST VARIATIONS    ////////////
  ////////////////////////////////////////////////
  const whosepostvariation = [
    {
      number: 1,
      name: "Feed",
    },
    {
      number: 2,
      name: "Following",
    }
  ];








  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////
  //////////////////////          FETCH POSTS          /////////////////////
  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////
  const [allPosts, setAllPosts] = useState([]);
  const postsPerFetch = 20;
  const [fetchedPosts, setfetchedPosts] = useState(null);



  ///////////////////////////////////////////////////////////////
  ////////////         GET INITIAL POSTS         ////////////////
  ///////////////////////////////////////////////////////////////
  useEffect(() => {

    const postsCollectionRef = collection(db, "posts");
    const followsCollectionRef = collection(db, 'follows');
    const currentUserId = user?.uid

    const GetFollowedUsersIds = async () => {
      const followedUsersQuerySnapshot = user && await getDocs(
        query(followsCollectionRef, where('followerId', '==', currentUserId)));
      const followedUserIds = user && followedUsersQuerySnapshot.docs.map((doc) => doc.data().followingId);
      setfollowedUserIds(followedUserIds)
      return followedUserIds
    }


    const getPosts = async () => {
      // start fetching
      setLoadingPosts(true)
      await GetFollowedUsersIds()

      const getQuery = () => {
        if (currentwhosePost === "Feed") {
          return query(postsCollectionRef, where('postType', '==', currentPost), orderBy("createdAt", 'desc'), limit(postsPerFetch))
        }
        // when user is signed in but doesn't follow anyone/ their followees😅 haven't posted anything
        else if (user && followedUserIds?.length < 1 && (currentwhosePost === "Following")) {
          setLoadingPosts(false)
          return null
        }
        else if (user && (currentwhosePost === "Following")) {
          return query(postsCollectionRef, where('postType', '==', currentPost), where('authorId', 'in', followedUserIds), orderBy("createdAt", 'desc'), limit(postsPerFetch));
        }
        // when user isn't signed in and wants to see posts from their imaginary followed user
        else if (!user && (currentwhosePost === "Following")) {
          return null
        }
      }


      const q = getQuery();
      if (q == null) {
        setAllPosts([])
        return
      }
      else {
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const newDataArray = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            newDataArray.push(data);
          });


          setAllPosts(newDataArray)
          const documents = snapshot.docs;
          setfetchedPosts(documents[documents.length - 1])
          setLoadingPosts(false)
        });
        return unsubscribe;
      }
    };

    try {
      getPosts();
    } catch (error) {
      if (error.code === "failed-precondition") {
        toast.error("Internet ")
      }
    }

    
  }, [currentPost, currentwhosePost, user]);




  ///////////////////////////////////////////////////////////////
  //////     GET NEW POSTS WHEN USER SCROLLS TO THE END    //////
  ///////////////////////////////////////////////////////////////
  useEffect(() => {

    const postsCollectionRef = collection(db, "posts");


    const loadMorePosts = async () => {
      if (typeof window === 'undefined' || typeof document === 'undefined') return;


      // Check if the user has scrolled to the bottom of the page.
      const scrollTop = document.documentElement.scrollTop;

      if (scrollTop + window.innerHeight === document.body.offsetHeight) {
        // start fetching
        if (!loadingPosts && fetchedPosts) {
          setLoadingPosts(true);


          const getQuery = () => {
            if (currentwhosePost === "Feed") {
              return query(postsCollectionRef, where('postType', '==', currentPost), orderBy("createdAt", "desc"), limit(postsPerFetch), startAfter(fetchedPosts))
            }

            // when user is signed in but doesn't follow anyone
            else if (user && followedUserIds.length < 1 && (currentwhosePost === "Following")) {
              setLoadingPosts(false)
              return null
            }

            else if (user && (currentwhosePost === "Following")) {
              return query(postsCollectionRef, where('postType', '==', currentPost), where('authorId', 'in', followedUserIds), orderBy("createdAt", "desc"), limit(postsPerFetch), startAfter(fetchedPosts));
            }

            // when user isn't signed in and wants to see posts from their imaginary followed user
            else if (!user && (currentwhosePost === "Following")) {
              return null
            }
          }


          const nextPageQuery = getQuery();
          if (nextPageQuery == null) {
            const newResult = []
            setAllPosts(allPosts.concat(newResult))
            return
          }
          else {
            const unsubscribe = onSnapshot(nextPageQuery, (snapshot) => {
              const newResult = [];
              snapshot.forEach((doc) => {
                const data = doc.data();
                newResult.push(data);
              });

              setAllPosts(allPosts.concat(newResult))
              const documents = snapshot.docs;
              setfetchedPosts(documents[documents.length - 1])


              // stop fetching
              setLoadingPosts(false)
            });
            return unsubscribe;
          }
        }
      }
      else return
    };

    window.addEventListener('scroll', loadMorePosts);

    return () => {
      window.removeEventListener('scroll', loadMorePosts)
    };
  }, [loadingPosts, fetchedPosts, user, currentPost, currentwhosePost, allPosts]);














  return (
    <main className={`app content-container`}>
      <WhoseandWhichpostH1
        variations={variations}
        currentPost={currentPost}
        setCurrentPost={setCurrentPost}
      />
      <WhoseandWhichpost variations={whosepostvariation} currentwhosePost={currentwhosePost} setCurrentWhosePost={setCurrentWhosePost} />



      <section className={styles.allposts}>
        {
          // user signed in but no post in the db
          user && currentwhosePost === 'Feed' && !loadingPosts && allPosts.length < 1 && <div className='infobox main'>
            <h2>Nothing here, Be the first to make a post  </h2>
            <Button name={'Make Post'} type={'primary'} link={'/post'} />
          </div>
        }
        {
          // user signed in but nothing in the following tab
          user && currentwhosePost === 'Following' && !loadingPosts && allPosts.length < 1 && <div className='infobox main'>
            <h2>Nothing here, Either you don&apos;t follow anyone or the people you follow haven&apos;t posted anything</h2>
          </div>
        }
        {
          // user not signed in and no post in the db
          !user && currentwhosePost === 'Feed' && !loadingPosts && allPosts.length < 1 && <div className='infobox main'>
            <h2>Nothing here, Sign in and be the first to make a post  </h2>
          </div>
        }
        {
          // user not signed in and current whose post = "following"
          !user && allPosts.length < 1 && currentwhosePost === 'Following' && <div className='infobox main'>
            <h2>Sign in 😏, you don&apos;t follow anybody  </h2>
            <Button name={'Sign in'} type={'primary'} link={'/auth'} />
          </div>
        }
        {allPosts?.map((post, index) => {

          if (loadingPosts) {
            return <PostSkeleton key={index} />
          } else if (currentPost === 'Articles') {
            return <ArticleCard key={index} post={post} />
          } else if (currentPost === 'Case Studies') {
            return <CaseStudyCard key={index} post={post} />
          } else {
            return <PhotoCard key={index} post={post} />
          }
        })}
      </section>
    </main>
  )
}