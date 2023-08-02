"use client"
import styles from "./casestudypage.module.scss"
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

import { collection, getDocs, getDoc, doc, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faCircle, faLocationDot, faUserTie } from "@fortawesome/free-solid-svg-icons";
import { useWindowWidth } from "@/utils/Hooks/ResponsiveHook";
import { toast } from "react-toastify";

export default function Page({ params }) {
    const router = useRouter()
    const [postData, setPostData] = useState(null)
    const [loadingpost, setloadingpost] = useState(true);
    const { postId } = params
    const width = useWindowWidth()

    useEffect(() => {

        const getPost = async () => {
            try {
                const postsCollectionRef = doc(db, `posts/${postId}`);
                const postDocs = await getDoc(postsCollectionRef);
                setPostData(postDocs.data())
                setloadingpost(false)
            } catch (error) {
                if (error.code === "unavailable") {
                    toast.error("Refresh the page, an errror occured while fetching data", {
                        position: "top-center"
                    })
                }
                if (error.code === "kErrorClientOffline") {
                    toast.error("Seems like you are offline, connect to the internet and try again")
                }
            }


        }
        getPost()
    }, [postId])


    const content = postData?.postContent
    const pageTitle = postData && `${postData.title} - case study by ${postData.authorName} | archi NG`

    const formatDate = (serverTimestamp) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'December'
        ];

        const getOrdinalSuffix = (day) => {
            if (day >= 11 && day <= 13) return 'th';
            if (day % 10 === 1) return 'st';
            if (day % 10 === 2) return 'nd';
            if (day % 10 === 3) return 'rd';
            return 'th';
        };

        const formatTime = (hours, minutes) => {
            const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
            const formattedMinutes = minutes.toString().padStart(2, '0');
            return `${formattedHours}:${formattedMinutes}`;
        };

        const date = serverTimestamp.toDate();
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';

        return `${day}${getOrdinalSuffix(day)} ${month} ${year}: ${formatTime(hours, minutes)}${ampm}`;
    };












    return (

        <>
            <title>{pageTitle}</title>

            <div className={styles.casestudy}>
                {
                    !loadingpost && postData &&
                    <div className={`content-container ${styles.container}`}>
                        <header className={styles.title}>
                            <h1>{postData.title}</h1>
                            {width > 719 && <span> Case Study by {postData.authorName}, {formatDate(postData.createdAt)}</span>}

                        </header>



                        <section className={styles.postinfosection}>
                            <div className={styles.coverimage}>
                                <Image
                                    src={postData.coverImageURL}
                                    alt={`case study post cover image`}
                                    height={900}
                                    width={1600}
                                    layout="responsive"
                                    placeholder="empty"

                                />
                            </div>

                            <div className={styles.caseinfo}>
                                <section className={styles.desc}>
                                    {/* <h6><FontAwesomeIcon icon={faUserTie} /> <span>Architect: </span> {postData.architect}</h6>
                                    <h6><FontAwesomeIcon icon={faCalendarDays} /> <span>Year: </span> {postData.year}</h6>
                                    <h6><FontAwesomeIcon icon={faLocationDot} /> <span>Location: </span> {postData.location?.join(', ')}</h6> */}
                                    <h6><span>architect:</span><br />  {postData.architect}</h6>
                                    <h6><span>year:</span> <br />  {postData.year}</h6>
                                    <h6><span>location:</span> <br />  {postData.location?.join(', ')}</h6>
                                    <h6><span>typology:</span> <br />  {postData.typology}</h6>
                                </section>


                                <section className={styles.otherinfo}>
                                    <div className={styles.postags}>
                                        {width > 1279 && <h6>Tags:</h6>}

                                        {
                                            postData.tags.map((tag, index) => {
                                                return (
                                                    <Link title='Explore tag' key={index} href={`/search?q=${tag}`}><em>{tag.toUpperCase()},</em></Link>
                                                )
                                            })
                                        }
                                    </div>
                                    <div className={styles.authorandtime}>
                                        <Link href={`/profile?id=${postData.authorId}`} title="visit author's profile" className={styles.authorinfo}>
                                            <img src={postData.authorAvatar} alt={'author image'} />
                                            <h6 title={postData.authorName}>{postData.authorName}</h6>
                                        </Link>
                                    </div>
                                </section>
                            </div>
                        </section>

                        <main dangerouslySetInnerHTML={{ __html: content }} />
                    </div>
                }

                {!loadingpost && !postData &&

                    <div className='infobox'>
                        <h2>Post doesn&apos; exist or has been deleted</h2>
                    </div>
                }
            </div>


        </>
    )
}







export const dynamicParams = false;
export async function generateStaticParams() {
    const postsCollection = collection(db, 'posts');
    const articlesQuery = query(postsCollection, where('postType', '==', 'Case Studies'));
    const articlesDocs = await getDocs(articlesQuery);

    return articlesDocs.docs.map((doc) => ({
        postId: doc.data().postId,
    }));
}




