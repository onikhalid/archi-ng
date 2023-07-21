"use client"
import styles from "./Archive.module.scss"
import { useEffect, useState } from "react";
import { auth, db } from "@/utils/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from 'next/navigation';
import PostSkeleton from "@/components/Posts/ShowingPosts/PostCards/Skeleton/PostSkeleton";
import WhoseandWhichpost from "@/components/Posts/ShowingPosts/Whosepost/whosepost";
import { BookmarkCard, FolderCard } from "@/components/Posts/ShowingPosts/PostCards/ArchivedPostCards/ArchiveCard";


const Archive = () => {
  const [whichOne, setwhichOne] = useState("Bookmarks");
  const [user, loading] = useAuthState(auth);
  const router = useRouter()

  //   ////////////////////////////////////////////////////////////////////
  // //// handle change UI that show user ehose what to  display///////
  // ////////////////////////////////////////////////////////////////////
  const whichpostvariation = [
    {
      number: 1,
      name: "Bookmarks",
    },
    {
      number: 2,
      name: "Folders",
    }
  ];





  const [allPosts, setAllPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState([]);

  const getPosts = async () => {
    setLoadingPosts(true)

    const bookmarksCollectionRef = collection(db, "bookmarks");
    const foldersCollectionRef = collection(db, 'folders');
    const currentUser = user?.uid


    const getQuery = () => {
      // bookmarks
      if (whichOne === "Bookmarks") {
        return query(bookmarksCollectionRef, where('userId', '==', currentUser))
      }

      else if (whichOne === "Folders") {

        return query(foldersCollectionRef, where('userId', '==', currentUser))
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
        setLoadingPosts(false)
      });
      return unsubscribe;
    }
  };








  useEffect(() => {
    if (user) {
      getPosts();
    }
    return
  }, [whichOne]);


  return (
    <main className="content-container">
      <h1>Archives</h1>
      <WhoseandWhichpost variations={whichpostvariation} currentwhosePost={whichOne} setCurrentWhosePost={setwhichOne} />
      {
        !loading && !user && <div className='infobox'>
          <h2>😒 Can't save any post without logging in</h2>
        </div>
      }
      {
        user && whichOne=='Bookmarks' && allPosts.length < 1 && <div className='infobox'>
          <h2>😒 You haven't saved any posts</h2>
        </div>
      }
      {
        user && whichOne=='Folders' && allPosts.length < 1 && <div className='infobox'>
          <h2>🤔 You haven't created any folders yet</h2>
        </div>
      }

      {
        user && <section className={styles.allposts}>
        {allPosts?.map((post, index) => {

          if (loadingPosts) {
            return <PostSkeleton key={index} />
          } else if (allPosts.length > 0 && whichOne === 'Bookmarks') {
            return <BookmarkCard key={index} post={post} />
          }
          else if (allPosts.length > 0 && whichOne === 'Folders') {
            return <FolderCard key={index} post={post} />
          }
        })}
      </section>
      }



    </main>
  )
}

export default Archive