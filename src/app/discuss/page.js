"use client"
import styles from './discuss.module.scss'
import { useContext, useEffect, useState } from "react";

import { db } from "@/utils/firebase";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";

import { toast } from "react-toastify";
import WhoseandWhichpost from "@/components/Posts/ShowingPosts/Whosepost/whosepost";
import DiscussCard from "@/components/Posts/ShowingPosts/PostCards/Discussions/DiscussionCard";
import PostSkeleton from '@/components/Posts/ShowingPosts/PostCards/Skeleton/PostSkeleton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '@/utils/ContextandProviders/Contexts';




const Discuss = () => {

  const [whoseDiscussion, setwhoseDiscussion] = useState("All");
  const { userData, setUserData, authenticatedUser } = useContext(UserContext);
  const [followedUserIds, setfollowedUserIds] = useState([]);
  const [allDiscussions, setAllDiscussions] = useState([]);
  const [filteredDiscussions, setFilteredDiscussions] = useState(allDiscussions);
  const [discussionSearchTerm, setDiscussionSearchTerm] = useState('');
  const [loadingPosts, setLoadingPosts] = useState(true);





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











  useEffect(() => {



    const getPosts = async () => {
      const postsCollectionRef = collection(db, 'posts')
      const q = query(postsCollectionRef, where('postType', '==', "Discussions"), orderBy("createdAt", 'desc'))

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


    getPosts()

    return () => { };
  }, []);


















  return (
    <>
      <title>Discussions | Archi NG</title>
      <meta name="description" content="Discussions | Archi NG" />

      <div className="content-container">
        <h1> Discussions</h1>

        <main>
          <section>
            <form id='searchdiscuss' className={styles.searchDiscuss}>
              <div className={`inputdiv ${styles.inputdiv}`}>
                <label htmlFor="SearchTerm">Search discussion topic or author</label>
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