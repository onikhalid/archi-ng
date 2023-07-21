
import styles from './whosepostH1Variation.module.scss'

import { useRef, useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleChevronDown, faCircleChevronUp } from "@fortawesome/free-solid-svg-icons";

const WhoseandWhichpostH1 = ({ variations, currentPost, setCurrentPost }) => {
    const wrapperRef = useRef(null)
    const pages = variations
    const [postOptionsOpen, setPostOptionsOpen] = useState(null);


    // change current post type option
    const changePost = (postOption) => {
        setCurrentPost(postOption.name)
        setPostOptionsOpen(false)
    }

    // open/close menu that allows user to change post type
    const openPostOptions = () => {
        if (postOptionsOpen === null) {
            setPostOptionsOpen(true)
        } else if (postOptionsOpen === true) {
            setPostOptionsOpen(false)
        } else if (postOptionsOpen === false) {
            setPostOptionsOpen(true)
        }
    }

    /////////////////////////////
    // options HTML element class
    const menuclasses  = () => {
        if (postOptionsOpen == null ) {
            return 'menu'
        } else if (postOptionsOpen ==  true){
            return 'menu open'
        } else return 'menu close'
    }

    //////////////////////////////////////////
    // Close menu when user clicks outside it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && postOptionsOpen && !wrapperRef.current.contains(event.target)) {
                setPostOptionsOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [postOptionsOpen]);





    return (
        <article ref={wrapperRef}>
            <h1 className={styles.h1}>{currentPost}
                <span className={styles.showmoreIcon} onClick={openPostOptions}>
                    <FontAwesomeIcon icon={postOptionsOpen ? faCircleChevronUp : faCircleChevronDown} shake />
                </span>
                <ul className={menuclasses ()}>
                    {
                        pages.map((post, index) => (
                            <li
                                className='option'
                                onClick={() => changePost(post)}
                                key={index}>{post.name}
                            </li>
                        ))
                    }
                </ul>
            </h1>
        </article>
    )
}
export default WhoseandWhichpostH1