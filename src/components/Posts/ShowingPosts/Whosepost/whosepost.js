import React from 'react'
import styles from './whosepost.module.scss'

const WhoseandWhichpost = ({currentwhosePost, setCurrentWhosePost, variations}) => {

    const pages = variations

    const changeWhosePost = (whose) => {
        setCurrentWhosePost(whose.name)
    }

    return (
        <article>
            <ul className={styles.whoseoption}>
                {
                    pages.map((whose) => (
                        <li
                            className={`${styles.option} ${currentwhosePost === whose.name && styles.active}`}
                            onClick={() => changeWhosePost(whose)}
                            key={whose.number}>{whose.name}
                        </li>
                    ))
                }
            </ul>
        </article>
    )
}

export default WhoseandWhichpost