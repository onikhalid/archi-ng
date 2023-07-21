import styles from './Photo.module.scss'
import Button from "@/components/Button/button"
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useWindowWidth } from '@/utils/Hooks/ResponsiveHook';



const PhotoCard = ({ post }) => {
    const width = useWindowWidth()

    const avatar = post.authorAvatar

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


    const test = console.log('rendered')

    return (
        <div className={styles.casestudy}>
            {/* <div className={styles.postimage}>
                <img src={post.imageURL} alt={'article image'} />
            </div>

            <div className={styles.authorandtime}>
                <div className={styles.authorinfo}>
                    <img src={avatar} alt={'author image'} />
                    <h5>{post.authorName}</h5>
                </div>
                <div className={styles.posttime}>
                    <span className={styles.dot}><FontAwesomeIcon icon={faCircle} shake /></span>
                    <span>{timeAgo}</span>
                </div>
            </div>

            <div className={styles.postinfo}>
                <h3 className={styles.title}>{post.postTitle}</h3>
                <p className={styles.desc}>{width > 720 ? `${post.postDesc.substring(0, 350)}...` : `${post.postDesc.substring(0, 150)}...`}</p>

                <Button name={"Archive"} link={"/post"} type={"primary"} />
                <Button name={"Read More"} link={test} type={"secondary"} />
            </div> */}
            wawu
        </div>
    )
}

export default PhotoCard