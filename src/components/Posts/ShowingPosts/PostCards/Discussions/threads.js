import styles from './threads.module.scss'


import ContributionCard from '@/components/Posts/ShowingPosts/PostCards/Discussions/ContributionCard'
import React, { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { auth, db } from '@/utils/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ThreadContext, UserContext } from '@/utils/ContextandProviders/Contexts';
import { addDoc, collection, doc, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useWindowWidth } from '@/utils/Hooks/ResponsiveHook';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { categorizeDate } from '@/functions/Formatting';


const Threads = ({ setShowThreads }) => {
    const width = useWindowWidth()
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const [user, loading] = useAuthState(auth);
    const { userData, setUserData } = useContext(UserContext);
    const { thread, setThread, threadParent, setThreadParent } = useContext(ThreadContext);
    const [nestedContributions, setNestedcontributions] = useState([]);




    useEffect(() => {
        const getContributions = async () => {
            try {
                if (thread) {


                    const contributionsCollectionRef = collection(db, "contributions");
                    const contributionsDocsRef = query(contributionsCollectionRef, where('parentContributionId', '==', thread), orderBy('createdAt'));


                    onSnapshot(contributionsDocsRef, async (snapshot) => {
                        const data = []
                        snapshot.docs.forEach(contribute => {
                            data.push(contribute.data())
                        });

                        setNestedcontributions(data)

                    })

                } else {
                    return
                }

            }

            catch (error) {
                if (error.code === "unavailable") {
                    toast.error("Refresh the page, an errror occured while fetching data", {
                        position: "top-center",
                        autoClose: 5000
                    })
                }
                if (error.code === "client-offline") {
                    toast.error("Seems like you are offline, connect to the internet and try again")
                }
                if (error.code === 3) {
                    toast.error("Seems like you are offline, connect to the internet and try again")
                }
            }
        }



        getContributions()
        return () => { };
    }, [thread]);




    //////////////////////////////////////////////////////////////
    ////////////        THREADED  CONTRIBUTIONS       ////////////
    //////////////////////////////////////////////////////////////
    const newReply = async (data) => {
        if (!user) {
            toast.error("Login to contribute", {
                position: "top-center",
                autoClose: 4000
            })
            return
        }
        else {
            const newContribution = {
                authorName: user.displayName,
                authorPhoto: user.photoURL,
                authorId: user.uid,
                authorUsername: userData.username,
                createdAt: new Date(),
                text: data.Reply,
                // postId: postId,
                parentContributionId: thread,
            }

            const contributionsCollectionRef = collection(db, `contributions`)
            const newPostRef = await addDoc(contributionsCollectionRef, newContribution);
            const replyId = newPostRef.id
            await updateDoc(doc(contributionsCollectionRef, newPostRef.id), {
                contributeId: replyId
            });

            setValue("Reply", "")
        }
    }




    const closeThread = () => {
        setThread(null)
        setShowThreads(false)
        setThreadParent(null)
    }






    const groupedContributions = {};

    nestedContributions?.forEach((contribute) => {
        const category = categorizeDate(contribute.createdAt);

        if (!groupedContributions[category]) {
            groupedContributions[category] = [];
        }

        groupedContributions[category].push(contribute);
    })









    return (
        <>

            {
                thread == null &&

                <div className={styles.infobox}>
                    <h3>Select a contribution to see the replies under it</h3>
                </div>

            }



            {
                thread &&
                <>
                    <section className={styles.parentThread}>
                        {/* <span> */}
                        <h6>#Thread</h6>
                        {/* </span> */}
                        <ContributionCard post={threadParent} />
                        <span>
                            <h6>{nestedContributions.length} replies</h6>
                            {width < 1020 && <span><FontAwesomeIcon onClick={closeThread} icon={faX} /></span>}
                        </span>
                    </section>




                    <section className={StyleSheet.allThreadContributions}>
                        {
                            // Object.entries returns an array of the Object properties
                            //a long way to go Khalid
                            Object.entries(groupedContributions).map(([date, contributions], index) => (
                                <div key={index}>
                                    <strong>{date}</strong>
                                    {contributions.map((contribute, innerIndex) => (
                                        <ContributionCard key={innerIndex} post={contribute} />
                                    ))}
                                </div>
                            ))
                        }

                    </section>




                    <section>
                        {user &&
                            <form id='reply' className={styles.writereply} onSubmit={handleSubmit(newReply)}>

                                <div className={`inputdiv ${styles.inputdiv}`}>
                                    <textarea
                                        id="reply" name="reply" type="text"
                                        placeholder="Add more spice to the convo" rows={2}
                                        {...register("Reply", { required: true })} />
                                    {errors.Reply && <span>You can&apos;t submit an empty contribution</span>}
                                </div>

                                <button form="reply" type="submit" className={'capsulebutton'}>Reply</button>



                            </form>
                        }
                    </section>



                </>
            }

        </>
    )

}

export default Threads