import Link from "next/link"
import styles from "./ContributionCard.module.scss"
import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons"
import Button from "@/components/Button/button"
import { formatDate } from "@/functions/Formatting"
import { useWindowWidth } from "@/utils/Hooks/ResponsiveHook"




const ContributionCard = ({ post }) => {

    const { authorId, authorUsername, authorName, authorPhoto, createdAt, contributionId, text } = post

    const width = useWindowWidth()


    return (
        <article className={styles.contributioncard}>
            <section className={styles.up}>
                    <Link href={`/profile/${authorUsername}`}>
                        <Image src={authorPhoto} width={25} height={25} />
                        <h6>{authorName}</h6>
                    </Link>

                {/* {} */}
                <div>

                </div>
            </section>
            <section className={styles.down}>
                {text}
            </section>
        </article>
    )
}

export default ContributionCard