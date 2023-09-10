import Link from "next/link"
import styles from "./Discuss.module.scss"
import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons"
import Button from "@/components/Button/button"
import { formatDate } from "@/functions/Formatting"
import { useWindowWidth } from "@/utils/Hooks/ResponsiveHook"




const DiscussCard = ({ post }) => {

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
                    {width > 720 && <h3>{post.title.substring(0, 42)}{post.title.length > 42 && "..."}</h3>}
                    {width < 720 && <h3>{post.title.substring(0, 31)}{post.title.length > 31 && "..."}</h3>}
                    {post.createdAt && <span>created on {formatDate(post.createdAt)}</span>}
                    
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