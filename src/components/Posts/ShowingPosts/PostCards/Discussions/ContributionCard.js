import styles from "./ContributionCard.module.scss"

import Link from "next/link"
import Image from "next/image"
import { ThreadContext, UserContext } from "@/utils/ContextandProviders/Contexts"
import { useContext, useEffect, useRef, useState } from "react"
import { useWindowWidth } from "@/utils/Hooks/ResponsiveHook"
import { arrayRemove, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where, writeBatch } from "firebase/firestore"
import { db } from "@/utils/firebase"
import { AMPMTime } from "@/functions/Formatting"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons"



const ContributionCard = ({ post, clickable, setShowThreads }) => {

    const { authorId, authorUsername, authorName, authorPhoto, createdAt, contributeId, postId, text } = post
    const { thread, setThread, threadParent, setThreadParent } = useContext(ThreadContext);
    const [replies, setReplies] = useState([]);
    const width = useWindowWidth()
    const { userData, setUserData, authenticatedUser } = useContext(UserContext);
    const delButtonRef = useRef(null)




    const showReplies = (e) => {
        if (delButtonRef.current && !delButtonRef.current.contains(e.target)) {
            if (clickable) {
                setThread(contributeId)
                setThreadParent(post)
                setShowThreads(true)
            } else {
                return
            }
        }
        else if (!delButtonRef.current) {
            if (clickable) {
                setThread(contributeId)
                setThreadParent(post)
                setShowThreads(true)
            } else {
                return
            }
        }

    }




    useEffect(() => {

        const getReplies = () => {
            const contributionsCollectionRef = collection(db, "contributions");
            const contributionsDocsRef = query(contributionsCollectionRef, where('parentContributionId', '==', contributeId));


            onSnapshot(contributionsDocsRef, async (snapshot) => {
                setReplies(snapshot.docs.length)

            })
        }

        if (clickable && contributeId) {
            getReplies()
        }

        return () => { };
    }, [contributeId]);





    const delContributionOrReply = async () => {
        const docRef = doc(db, `contributions/${contributeId}`)

        if (clickable) {
            const contributionsCollectionRef = collection(db, "contributions");
            const repliesQuery = query(contributionsCollectionRef, where('parentContributionId', '==', contributeId));
            const batch = writeBatch(db);


            const repliesDocsSnapshot = await getDocs(repliesQuery);
            repliesDocsSnapshot.forEach((replyDoc) => {
                const docRef = doc(db, `contributions/${replyDoc.contributeId}`);
                batch.delete(docRef);
            });

            await batch.commit();
            deleteDoc(docRef)
            if (contributeId === thread) {
                setThread(null)
            }

        } else {
            deleteDoc(docRef)
            if (contributeId === thread) {
                setThread(null)
            }
        }


        const contributionsCollections = collection(db, 'contributions')
        const postRef = doc(db, `posts/${postId}`)
        const userConributions = query(contributionsCollections, where('postId', '==', postId), where('authorId', '==', authorId));
        const userConributionSnap = await getDocs(userConributions)


        if (userConributionSnap.docs.length < 1) {
            await updateDoc(postRef, { contributors: arrayRemove(authorId) })
        }

    }




    return (
        <article className={styles.contributioncard} onClick={(e) => showReplies(e)} style={clickable && { 'cursor': `pointer` }}>
            <section className={styles.up}>
                <Link href={`/profile/${authorUsername}`} title="visit user profile">
                    <Image src={authorPhoto} width={20} height={20} alt={`${authorName}'s photo`} />
                </Link>
                <h6>{authorName.substring(0, 30)}{authorName.length > 30 && "..."} - <span>{AMPMTime(createdAt)}</span></h6>

                {authenticatedUser?.uid === post.authorId &&

                    <span className={styles.deleteicon} title={clickable ? `delete contribution` : `delete reply`} onClick={delContributionOrReply} ref={delButtonRef}>
                        <FontAwesomeIcon icon={faTrashAlt} />
                    </span>
                }
            </section>



            <section className={styles.down}>
                <p> {text}</p>
            </section>



            {
                clickable &&
                <aside className={styles.replies}>
                    {replies} Replies &gt;
                </aside>
            }

        </article>
    )
}

export default ContributionCard