"use client"
import styles from "./Archive.module.scss"
import { useContext, useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import PostSkeleton from "@/components/Posts/ShowingPosts/PostCards/Skeleton/PostSkeleton";
import WhoseandWhichpost from "@/components/Posts/ShowingPosts/Whosepost/whosepost";
import { BookmarkCard, FolderCard } from "@/components/Posts/ShowingPosts/PostCards/ArchivedPostCards/ArchiveCard";
import { useForm } from "react-hook-form";
import { createFolder } from "@/functions/Bookmark";
import { toast } from "react-toastify";
import { UserContext } from "@/utils/ContextandProviders/Contexts";



const Archive = () => {
  const [archiveType, setArchiveType] = useState("Bookmarks");
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [userFolders, setUserFolders] = useState([]);
  const { userData, setUserData, authenticatedUser, loadingauthenticatedUser } = useContext(UserContext);

  const router = useRouter()
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  const [allPosts, setAllPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState([]);


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







  useEffect(() => {
    try {

      const getArchivedPosts = async () => {
        setLoadingPosts(true)

        if (!loadingauthenticatedUser && !authenticatedUser) {
          setAllPosts([])
          return
        }
        else if (authenticatedUser) {
          const currentUser = authenticatedUser?.uid


          const foldersCollectionRef = collection(db, "folders");
          const foldersQuery = query(foldersCollectionRef, where('userId', '==', currentUser))
          onSnapshot(foldersQuery, (snapshot) => {
            const folders = []
            snapshot.forEach((doc) => {
              const data = doc.data();
              folders.push(data);
            });
            setUserFolders(folders)
          });


          const bookmarksCollectionRef = collection(db, "bookmarks");
          const bookmarksQuery = query(bookmarksCollectionRef, where('userId', '==', currentUser))
          onSnapshot(bookmarksQuery, (snapshot) => {
            const bookmarks = []
            snapshot.forEach((doc) => {
              const data = doc.data();
              bookmarks.push(data);
            });
            setUserBookmarks(bookmarks)
          });
        }
      };

      getArchivedPosts();
      setLoadingPosts(false)
    }
    catch (error) {
      if (error.code === "unavailable") {
        toast.error("You seem to be offline, connect to the internet and try again", {
          position: "top-center",
          autoClose: 2500
        })
      } else {
        console.log(error)
      }
    }
    return () => { }
  }, [archiveType, authenticatedUser]);



  //create a folder
  const CreateNewFolder = (data) => {
    createFolder(data.Name, userData?.id, userData?.name)
  }

  const pageTitle = `Archives - ${userData ? `${userData.name}'s` : `No one's 🙄`} ${archiveType} |  Archi NG`









  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={`Archives - ${userData ? `${userData?.name}'s` : `No one's 🙄`} Archives |  Archi NG` }/>


      <main className="content-container">
        <header className={styles.authPageHeader}>
          <h1>Archives</h1>
          <WhoseandWhichpost variations={whichpostvariation} currentwhosePost={archiveType} setCurrentWhosePost={setArchiveType} />
        </header>


        {
          !loadingauthenticatedUser && !authenticatedUser &&
          <div className='infobox'>
            <h3>😒 Can&apos;t save any posts without logging in</h3>
          </div>
        }



        {
          authenticatedUser &&
          <>

            {/* //////////////////////////////////////////////////////////// */}
            {/* ///////////////         FOLDERS          /////////////////// */}
            {/* //////////////////////////////////////////////////////////// */}

            {archiveType == "Folders" &&

              <>
                <form id='createfolder' className={styles.createfolder} onSubmit={handleSubmit(CreateNewFolder)}>
                  <div className={`inputdiv ${styles.inputdiv}`}>
                    <label htmlFor="Name">New Folder Name<span>*</span></label>
                    <input
                      id="Name" name="Name" type="text"
                      placeholder="Studio works"
                      {...register("Name", { required: true })} />
                    {errors.Name && <span>This field is required</span>}
                  </div>
                  <button form="createfolder" type="submit" className='capsulebutton'>Create Folder</button>
                </form>


                {
                  userFolders.length < 1 ?

                    <div className='infobox'>
                      <h2>😒 You haven&apos;t created any folder</h2>
                    </div>

                    :

                    <section className={`${styles.allposts} ${styles.dockets}`}>
                      {userFolders?.map((post, index) => {
                        if (loadingPosts) {
                          return <PostSkeleton key={index} />
                        }
                        else return <FolderCard key={index} post={post} />
                      })}
                    </section>
                }
              </>
            }








            {/* ////////////////////////////////////////////////////////////// */}
            {/* ///////////////         BOOKMARKS          /////////////////// */}
            {/* ////////////////////////////////////////////////////////////// */}

            {archiveType === "Bookmarks" &&

              <>
                {
                  userBookmarks.length < 1 ?

                    <div className='infobox'>
                      <h2>😒 You haven&apos;t saved any posts</h2>
                    </div>

                    :

                    <section className={styles.allposts}>
                      {userBookmarks?.map((post, index) => {
                        if (loadingPosts) {
                          return <PostSkeleton key={index} />
                        }
                        else return <BookmarkCard key={index} post={post} />
                      })}
                    </section>
                }
              </>

            }
          </>
        }

      </main>
    </>

  )
}

export default Archive