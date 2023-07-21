import styles from './Casestudy.module.scss'
import Link from 'next/link';
import { useState } from 'react';
import { useWindowWidth } from '@/utils/Hooks/ResponsiveHook';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/utils/firebase';
import { faCircle, faFolder, faArrowUpRightFromSquare, faCircleCheck, faUserTie, faCalendarDays, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addBookmark } from '../../InteractingWithPosts/Likes and Comments/Bookmark';
import { toast } from 'react-toastify';
import Button from "@/components/Button/button"
import PostMenu from './PostCardMenu/PostMenu';



const CaseStudyCard = ({ post }) => {
    const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
    const width = useWindowWidth()
    const [saved, setSaved] = useState(false)
    const [menuOpen, setMenuOpen] = useState(null)
    const [user, loading] = useAuthState(auth)

    const avatar = post.authorAvatar
    const tags = post?.tags.slice(0, 3)
    const postTime = post.createdAt;
    const serverDate = postTime.toDate();
    const currentDate = new Date();
    let timeDifference = currentDate.getTime() - serverDate.getTime();

    
    // Calculate the number of seconds, minutes, hours, days, months, and years ago
    const secondsAgo = Math.floor(timeDifference / 1000);
    const minutesAgo = Math.floor(timeDifference / (1000 * 60));
    const hoursAgo = Math.floor(timeDifference / (1000 * 60 * 60));
    const daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const monthsAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 30.42)); // Approximate months
    const yearsAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 365.25)); // Approximate years

    // Determine the appropriate time period
    let timeAgo;
    if (yearsAgo >= 1) {
        timeAgo = yearsAgo + 'y'
    } else if (monthsAgo >= 1) {
        timeAgo = monthsAgo + 'mo'
    } else if (daysAgo >= 1) {
        timeAgo = daysAgo + 'd'
    } else if (hoursAgo >= 1) {
        timeAgo = hoursAgo + 'h'
    } else if (minutesAgo >= 1) {
        timeAgo = minutesAgo + (minutesAgo === 1 ? " min" : " min");
    } else {
        timeAgo = secondsAgo + 's';
    }

    // change icon to show user has bookmarked post
    const bookmarkPost = () => {
        if(!user){
            toast.error('Sign in to save posts', {
                position: 'top-center',
                autoClose: 3000
            })
            return
        }
        setSaved(true)
        addBookmark(post.postId, user.uid)

        setTimeout(() => {
            setSaved(false)
        }, 2500);
    }



    return (
        <article className={styles.casestudy}>
            <section className={styles.postimage}>
                <img src={post.coverImageURL} alt={'case study cover image'} />
            </section>

            <div className={styles.mainInfo}>
                <section>
                    <section className={styles.metadata}>
                        <div className={styles.authorandtime}>
                            <Link href={'/'} title="visit author's profile" className={styles.authorinfo}>
                                <img src={avatar} alt={'author image'} />
                                <h6>{post.authorName}</h6>
                            </Link>
                            <div className={styles.posttime}>
                                <span className={styles.dot}><FontAwesomeIcon icon={faCircle} shake /></span>
                                <span>{timeAgo}</span>
                            </div>
                        </div>
                        <PostMenu
                            menuOpen={menuOpen}
                            setOpen={setMenuOpen}
                            authorId={post.authorId}
                            postId={post.postId}
                            postType={post?.postType}
                            postLink={`${baseURL}/post/article/${post.postId}`}
                        />
                    </section>

                    <section className={styles.postinfo}>
                        <h3 className={styles.title} title={post.title}>{post.title.substring(0, 40)}{post.title.length > 40 && "..."}</h3>
                        <div className={styles.desc}>
                            <h6><FontAwesomeIcon icon={faUserTie} /> <span>Architect: </span> {post.architect}</h6>
                            <h6><FontAwesomeIcon icon={faCalendarDays} /> <span>Year: </span> {post.year}</h6>
                            <h6><FontAwesomeIcon icon={faLocationDot} /> <span>Location: </span> {post.location}</h6>
                        </div>
                    </section>
                </section>

                <section className={styles.bottomsection}>
                    <div className={styles.postags}>
                        {
                            tags.map((tag, index) => {
                                return (
                                    <Link title='Explore tag' key={index} href={`/search?q=${tag}`}><em>{tag.toUpperCase()},</em></Link>
                                )
                            })
                        }
                        <Link href={`/search?q=${post.typology}`}><em>{post.typology}</em></Link>
                    </div>

                    <div className={styles.buttongroup}>
                        <Button name={saved ? 'Saved' : 'Save'} icon={saved ? <FontAwesomeIcon icon={faCircleCheck} /> : <FontAwesomeIcon icon={faFolder} />} link={bookmarkPost} type={"tertiary"} />
                        <Button name={"Read"} icon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />} link={`/post/case-study/${post.postId}`} type={"type4"} />
                    </div>
                </section>
            </div>



        </article>
    )
}

export default CaseStudyCard