import styles from './Article.module.scss'
import { useState } from 'react';
import Link from 'next/link';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faFolder, faArrowUpRightFromSquare, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import Button from "@/components/Button/button"
import { useWindowWidth } from '@/utils/Hooks/ResponsiveHook';
import { addBookmark } from '../../InteractingWithPosts/Likes and Comments/Bookmark';
import PostMenu from './PostCardMenu/PostMenu';

import { auth } from '@/utils/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';


const ArticleCard = ({ post }) => {
    const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
    const width = useWindowWidth()
    const [user, loading] = useAuthState(auth)
    const [saved, setSaved] = useState(false)
    const [menuOpen, setMenuOpen] = useState(null)

    const avatar = post.authorAvatar
    const tags = post?.tags.slice(0, 3)
    const postTime = post.createdAt;
    const serverDate = postTime.toDate();
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - serverDate.getTime();

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
        timeAgo = monthsAgo + 'm'
    } else if (daysAgo >= 1) {
        timeAgo = daysAgo + 'd'
    } else if (hoursAgo >= 1) {
        timeAgo = hoursAgo + 'h'
    } else if (minutesAgo >= 1) {
        timeAgo = minutesAgo + (minutesAgo === 1 ? " min" : " min");
    } else {
        timeAgo = secondsAgo + 's';
    }

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
        <article className={styles.article}>
            <header className={styles.postheader}>
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
            </header>

            <div className={styles.postimage}>
                <img src={post.coverImageURL} alt={'article image'} />
            </div>

            <div className={styles.postinfo}>
                <h3 className={styles.title}>
                    {post.title}
                </h3>
                <p className={styles.desc}>
                    {width > 720 ? `${post.desc?.substring(0, 350)}...` : `${post.desc?.substring(0, 150)}...`}
                </p>
                <div>
                    <div className={styles.postags}>
                        {
                            tags.map((tag, index) => {
                                return (
                                    <Link title='Explore tag' key={index} href={`/search?q=${tag}`}><em>{tag.toUpperCase()},</em></Link>
                                )

                            })
                        }

                    </div>
                    <div className={styles.buttongroup}>
                        <Button name={saved ? 'Saved' : 'Save'} icon={saved ? <FontAwesomeIcon icon={faCircleCheck} /> : <FontAwesomeIcon icon={faFolder} />} link={bookmarkPost} type={"tertiary"} />
                        <Button name={"Read"} icon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />} link={`/post/article/${post.postId}`} type={"type4"} />
                    </div>
                </div>

            </div>
        </article>
    )
}

export default ArticleCard