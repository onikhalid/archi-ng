import Link from "next/link"
import styles from "./DiscussCard.module.scss"
import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowUpRightFromSquare, faBookmark, faComment, faUsers } from "@fortawesome/free-solid-svg-icons"
import Button from "@/components/Button/button"
import { formatDate } from "@/functions/Formatting"
import { useWindowWidth } from "@/utils/Hooks/ResponsiveHook"
import { UserContext } from "@/utils/ContextandProviders/Contexts"
import { useContext } from "react"





const DiscussCard = ({ post }) => {
    const { authenticatedUser } = useContext(UserContext);

    const width = useWindowWidth()


    return (
        <article className={styles.postcard}>
            <section className={styles.postimage}>
                <img
                    src={post.coverImageURL}
                    alt={`${post.title} cover image`}
                />
            </section>

            <section className={styles.postinfo}>
                <div className={styles.infotop} title={post.title}>
                    {width > 720 && <h3>{post.title.substring(0, 50)}{post.title.length > 50 && "..."}</h3>}
                    {width < 720 && <h3>{post.title.substring(0, 31)}{post.title.length > 31 && "..."}</h3>}
                    {post.createdAt && <span>started on {formatDate(post.createdAt)}</span>}

                    <div className={styles.poststats}>
                        <article className={post.bookmarks?.includes(authenticatedUser?.uid) ? `${styles.bookmarkedstat}` : `${styles.stat}`} title='bookmarks'>
                            <span>
                                <FontAwesomeIcon icon={faBookmark} />
                            </span>
                            <h5>{post.bookmarks ? post.bookmarks.length : 0}</h5>
                        </article>

                        <article className={styles.comment} title='contibutors'>
                            <FontAwesomeIcon icon={faUsers} />
                            <h5>{post.contributors ? post.contributors.length : 0} </h5>
                        </article>
                    </div>

                </div>

                <div className={styles.infobottom}>
                    <Link className={styles.authorinfo} href={`/profile?id=${post.authorId}`}>
                        <Image
                            src={post.authorAvatar}
                            width={35}
                            height={35}
                            alt={'Discussion creator picture'}

                        />
                        <p>{post.authorName}</p>
                    </Link>

                    <Button name={width > 719 && 'See Discussion'} type={'type4'} icon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />} link={`/discuss/${post.postId}`} />


                </div>

            </section>

        </article>
    )
}

export default DiscussCard
