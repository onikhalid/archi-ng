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
import { useForm } from "react-hook-form";
import { createFolder } from "@/components/Posts/InteractingWithPosts/Likes and Comments/Bookmark";


const Archive = () => {
  const [whichOne, setwhichOne] = useState("Bookmarks");
  const [user, loading] = useAuthState(auth);
  const router = useRouter()
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();



  //////////////////////////////////////////////////////////////////////////////
  /////// handle change UI that show user the choices what to  display  ////////
  /////////////////////////////////////////////////////////////////////////////
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



  useEffect(() => {

    const getArchivedPosts = async () => {
      setLoadingPosts(true)

      const bookmarksCollectionRef = collection(db, "bookmarks");
      const foldersCollectionRef = collection(db, 'folders');
      const currentUser = user?.uid


      const getQuery = () => {

        // bookmarks
        if (user && whichOne === "Bookmarks") {
          return query(bookmarksCollectionRef, where('userId', '==', currentUser))
        }

        else if (user && whichOne === "Folders") {
          return query(foldersCollectionRef, where('userId', '==', currentUser))
        }

        else if (!user) {
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
          setLoadingPosts(false)
        });
        return unsubscribe;
      }
    };

    getArchivedPosts();
    return () => { }
  }, [whichOne, user]);




  //create a older
  const CreateNewFolder = (data) => {
    createFolder(data.Name, user.uid)
  }




  return (
    <main className="content-container">
      <header>
        <h1>Archives</h1>
        <WhoseandWhichpost variations={whichpostvariation} currentwhosePost={whichOne} setCurrentWhosePost={setwhichOne} />
      </header>


      {whichOne == "Folders" &&
        <form id='createfolder' className={styles.createfolder} onSubmit={handleSubmit(CreateNewFolder)}>

          <div className='inputdiv'>
            <label htmlFor="Name">New Folder Name<span>*</span></label>
            <input
              id="Name" name="Name" type="text"
              placeholder="Studio works"
              {...register("Name", { required: true })} />
            {errors.Name && <span>This field is required</span>}
          </div>
          <button form="createfolder" type="submit">Create Folder</button>


        </form>
      }

      {
        !loading && !user &&
        <div className='infobox'>
          <h2>😒 Can&apos;t save any post without logging in</h2>
        </div>
      }
      {
        user && whichOne == 'Bookmarks' && allPosts.length < 1 &&
        <div className='infobox'>
          <h2>😒 You haven&apos;t saved any posts</h2>
        </div>
      }
      {
        user && whichOne == 'Folders' && allPosts.length < 1 &&
        <div className='infobox'>
          <h2>🤔 You haven&apos;t created any folders yet</h2>
        </div>
      }

      {
        user && allPosts.length > 0 && <section className={whichOne == 'Folders' ? `${styles.allposts} ${styles.dockets}` : `${styles.allposts}`}>
          {allPosts?.map((post, index) => {

            if (loadingPosts) {
              return <PostSkeleton key={index} />
            } else if (whichOne === 'Bookmarks') {
              return <BookmarkCard key={index} post={post} />
            }
            else if (whichOne === 'Folders') {
              return <FolderCard key={index} post={post} />
            }
          })}
        </section>
      }



    </main>
  )
}

export default Archive