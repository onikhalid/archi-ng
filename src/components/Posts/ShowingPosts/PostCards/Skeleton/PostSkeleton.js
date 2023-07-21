import React from 'react'
import styles from './PostSkeleton.module.scss'

const PostSkeleton = () => {
    return (
        <div className='skeletoncard'>
            <div title='Image by rawpixel.com on Freepik' className={`${styles.cardimg}`}></div>
            <div className={styles.cardbody}>
                <h2 className={`${styles.cardtitle} skeleton`}></h2>
                <h2 className={`${styles.cardtitle} ${styles.cardsubtitle} skeleton`}></h2>
                <p className={`${styles.cardintro} ${styles.cardintro1} skeleton`}></p>
                <p className={`${styles.cardintro} skeleton`}></p>
                <p className={`${styles.cardintro} skeleton`}></p>
                <p className={`${styles.cardintro} ${styles.cardintroshort}  skeleton`}></p>

                <div className={styles.buttongroup}>
                    <div className={`${styles.button} skeleton`}></div>
                    <div className={`${styles.button2} skeleton`}></div>
                </div>
            </div>

        </div>
    )
}

export default PostSkeleton