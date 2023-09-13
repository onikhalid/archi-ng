"use client"
import styles from './discuss.module.scss'
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/utils/firebase";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";

import { toast } from "react-toastify";
import WhoseandWhichpost from "@/components/Posts/ShowingPosts/Whosepost/whosepost";
import DiscussCard from "@/components/Posts/ShowingPosts/PostCards/Discussions/DiscussionCard";
import PostSkeleton from '@/components/Posts/ShowingPosts/PostCards/Skeleton/PostSkeleton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';




const Discuss = () => {

  const [whoseDiscussion, setwhoseDiscussion] = useState("All");
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [followedUserIds, setfollowedUserIds] = useState([]);
  const [allDiscussions, setAllDiscussions] = useState([]);
  const [filteredDiscussions, setFilteredDiscussions] = useState(allDiscussions);
  const [discussionSearchTerm, setDiscussionSearchTerm] = useState('');
  const [user, loading] = useAuthState(auth);
  const [loadingPosts, setLoadingPosts] = useState(true);


  const fromwho = [
    {
      number: 1,
      name: "All",
    },
    {
      number: 2,
      name: "Following",
    }
  ];

  //create a discuss
  const searchDiscuss = (data) => {
    setDiscussionSearchTerm(data.Title)
    console.log(data)
  }

  const handleSearchChange = (e) => {
    const searchTerm = e.target.value.trim();
    setDiscussionSearchTerm(searchTerm);
    console.log(searchTerm)
  };

  useEffect(() => {

    if (discussionSearchTerm.trim() !== '') {

      const filtered = allDiscussions.filter((discussion) => {
        return (
          discussion.authorName.toLowerCase().includes(discussionSearchTerm.toLowerCase()) ||
          discussion.title.toLowerCase().includes(discussionSearchTerm.toLowerCase())
        );
      });

      setFilteredDiscussions(filtered);
    } else {
      setFilteredDiscussions(allDiscussions);
    }
  }, [discussionSearchTerm, allDiscussions]);








  const forumsPerFetch = 40;

  useEffect(() => {


    const GetFollowedUsersIds = async () => {
      try {
        const followedUsersQuerySnapshot = user && await getDocs(
          query(followsCollectionRef, where('followerId', '==', currentUserId)));
        const followedUserIds = user && followedUsersQuerySnapshot.docs.map((doc) => doc.data().followingId);
        setfollowedUserIds(followedUserIds)
        return followedUserIds
      } catch (error) {
        if (error.code === "failed-precondition") {
          toast.error("Poor internet connection")
        }
        else if (error.message.includes('Backend didn\'t respond' || "[code=unavailable]")) {
          toast.error("There appears to be a problem with your connection", {
            position: "top-center"
          })
        }
      }

    }



    const getPosts = async () => {
      await GetFollowedUsersIds()
      const postsCollectionRef = collection(db, 'posts')


      const getQuery = async () => {
        if (whoseDiscussion === "All") {
          return query(postsCollectionRef, where('postType', '==', "Discussions"), orderBy("createdAt", 'desc'))
        }
        // when user is signed in but doesn't follow anyone/ their followees😅 haven't posted anything
        else if (user && followedUserIds?.length < 1 && (whoseDiscussion === "Following")) {
          setLoadingPosts(false)
          return null
        }
        else if (user && (whoseDiscussion === "Following")) {
          return query(postsCollectionRef, where('postType', '==', "Discussions"), where('authorId', 'in', followedUserIds), orderBy("createdAt", 'desc'));
        }
        // when user isn't signed in and wants to see posts from their imaginary followed user
        else if (!user && (whoseDiscussion === "Following")) {
          return null
        }
      }
      const q = await getQuery()
      if (q == null) {
        console.log(q)
        setAllDiscussions([])
        return
      }
      else {
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const newDataArray = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            newDataArray.push(data);
          });


          setAllDiscussions(newDataArray)
          setLoadingPosts(false)
        });
        return unsubscribe;
      }



    }

    getPosts()


    return () => { };
  }, []);


















  return (
    <>
      <title>Discussions | Archi NG</title>

      <div className="content-container">
        {/* <header> */}
        <h1> Discussions</h1>
        <WhoseandWhichpost variations={fromwho} currentwhosePost={whoseDiscussion} setCurrentWhosePost={setwhoseDiscussion} />
        {/* </header> */}

        <main>
          <section>
            <form id='searchdiscuss' className={styles.searchDiscuss}>
              <div className={`inputdiv ${styles.inputdiv}`}>
                <label htmlFor="SearchTerm">Search discussion title or author</label>
                <input
                  id="SearchTerm" name="SearchTerm" type="text" onChange={handleSearchChange}
                  placeholder="How has 'Nigerian Architecture' gotten so bad" />
                <span className={styles.icon}>
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </span>

              </div>
            </form>
          </section>




          <section className={styles.allDiscussions}>
            {filteredDiscussions?.map((post, index) => {

              if (loadingPosts) {
                return <PostSkeleton key={index} />
              } else {
                return <DiscussCard key={index} post={post} />
              }
            })}
          </section>

        </main>

      </div>

    </>
  )
}

export default Discuss