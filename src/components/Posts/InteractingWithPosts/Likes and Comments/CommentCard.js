import styles from './CommentCard.module.scss'
import Image from 'next/image';
import { db, auth } from '@/utils/firebase';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Link from 'next/link';
import { formatDate } from '@/functions/Formatting';





export const CommentCard = ({ comment, postId }) => {
    const [user, loading] = useAuthState(auth);

    const deleteComment = async () => {
        const postDocRef = doc(db, `posts/${postId}`)
        await updateDoc(postDocRef, { comments: arrayRemove(comment) });
    }





    return (
        <article className={styles.commentcard}>
            <section className={styles.authorphoto}>
                <Link href={`/profile/?id=${comment.authorId}`}>
                    <Image src={comment.authorPhoto} alt='commentor photo' height={35} width={35} />
                </Link>
            </section>


            <section className={styles.comment}>
                <h6>{comment.authorName} <time><span>, {formatDate(comment.createdAt)}</span></time></h6>
                {comment.text}
            </section>


            {
                user && (user.uid === comment.authorId) &&
                <section onClick={deleteComment} className={styles.settings}>
                    <span title="Delete Remark"> <FontAwesomeIcon icon={faTrashAlt} /> </span>
                </section>
            }
        </article>
    )
}