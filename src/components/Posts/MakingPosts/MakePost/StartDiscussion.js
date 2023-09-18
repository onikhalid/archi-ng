"use client"
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import styles from './StartDiscussion.module.scss'

import { db, storage } from "@/utils/firebase"
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/utils/ContextandProviders/Contexts';





const StartDiscussion = ({ postToEditId, setIsWrongFormat }) => {
    const { userData, authenticatedUser } = useContext(UserContext);
    const router = useRouter();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();

    const [selectedCoverImage, setSelectedCoverImage] = useState(null);
    const [previousCoverImgURL, setPreviousCoverImgURL] = useState(null)
    const [coverImgURL, setCoverImgURL] = useState(null)
    const [createdAt, setCreatedAt] = useState({})





    const [title, setTitle] = useState('')
    const [desc, setDesc] = useState('')

    useEffect(() => {
        setValue("Title", title || "");
        setValue("Desc", desc || "");
    }, [title, desc]);

    const handleInputChange = (e) => {
        setValue(e.target.name, e.target.value);
    };

    useEffect(() => {
        const checkPostToEdit = async () => {
            if (postToEditId == null || '' || undefined) {
                return
            }
            else {
                const postToEditRef = doc(db, `posts/${postToEditId}`)
                const postToEditSnap = await getDoc(postToEditRef)
                const postToEdit = postToEditSnap.data()
                const { coverImageURL, title, desc, createdAt } = postToEdit
                setCoverImgURL(coverImageURL)
                setTitle(title)
                setDesc(desc)
                setCreatedAt(createdAt)

            }
        }

        checkPostToEdit()
    }, [postToEditId]);






    /////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////       IMAGE UPLOAD         /////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////
    ////////////        COVER IMAGE          //////////////////
    const handleCoverImageFileChange = async (event) => {
        const file = event.target.files[0];
        if (postToEditId) {
            setPreviousCoverImgURL(coverImgURL)
        }
        setSelectedCoverImage(file);

        const newImgURL = URL.createObjectURL(file)
        setCoverImgURL(newImgURL)

    };

    //upload selected image to firebase
    const uploadCoverImage = async (imageFile) => {
        if (postToEditId) {
            //delete previous image from firebase
            const startIndex = previousCoverImgURL.indexOf('/o/') + 3;
            const endIndex = previousCoverImgURL.indexOf('?alt=media');
            const encodedPath = previousCoverImgURL.substring(startIndex, endIndex);
            const storagePath = decodeURIComponent(encodedPath);
            const previousImageRef = ref(storage, storagePath)
            await deleteObject(previousImageRef)
        }

        const imageRef = ref(storage, `cover_images/${authenticatedUser.uid}/Discussions/${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile)
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    };









    const createDiscuss = async (data) => {
        let newpostID


        if (selectedCoverImage === null && !postToEditId) {
            toast.error("Select a cover image", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 4500,
            });
            return
        }

        let coverImageDownloadURL
        if (selectedCoverImage) {
            coverImageDownloadURL = await uploadCoverImage(selectedCoverImage)
        } else coverImageDownloadURL = coverImgURL


        const postData = {
            authorId: authenticatedUser.uid,
            authorName: authenticatedUser.displayName,
            authorAvatar: authenticatedUser.photoURL,
            coverImageURL: coverImageDownloadURL,
            createdAt: postToEditId ? createdAt : new Date(),
            desc: data.Desc,
            postId: postToEditId ? postToEditId : authenticatedUser.uid,
            titleForSearch: data.Title.split(/[,:.\s-]+/).filter(word => word !== ''),
            title: data.Title,
            postType: "Discussions",
        }




        const contributionsCollectionRef = collection(db, `contributions`)
        const newContribution = {
            authorName: userData.name,
            authorPhoto: userData.profilePicture,
            authorId: authenticatedUser.uid,
            authorUsername: userData.username,
            image: coverImageDownloadURL,
            createdAt: new Date(),
            text: data.Desc,
            parentContributionId: null
        }





        const postsCollectionRef = collection(db, `posts`)
        // await updateDoc(doc(postsCollectionRef, postId), 
        //   contributors: arrayUnion(authenticatedUser?.uid)



        const postCollectionRef = collection(db, "posts");


        if (postToEditId) {
            await updateDoc(doc(postCollectionRef, postToEditId), postData);

            const batch = writeBatch(db);
            const allBookmarkedUsersPostsQuery = query(collection(db, 'bookmarks'), where('postId', '==', postToEditId));
            const allBookmarkedUsersPostsSnap = await getDocs(allBookmarkedUsersPostsQuery)

            allBookmarkedUsersPostsSnap.docs.forEach(async (bookmarks) => {
                const bookmark = bookmarks.data();
                const postDocRef = doc(db, `bookmarks/${bookmark.bookmarkId}`)

                batch.update(postDocRef, {
                    title: data.Title,
                    coverImageURL: coverImageDownloadURL
                })
            })
            await batch.commit();
            router.push(`/discuss/${postToEditId}`)
        }
        else {

       
            const newPostRef = await addDoc(postCollectionRef, postData);
            const postId = newPostRef.id
            newpostID = newPostRef.id
            await updateDoc(doc(postCollectionRef, newPostRef.id), {
                postId: postId
            });//updating the new post with the newly created document Id

            
            //create discuss 1st message
            const newContributionRef = await addDoc(contributionsCollectionRef, newContribution);
            const contributeId = newContributionRef.id
            await updateDoc(doc(contributionsCollectionRef, newContributionRef.id), {
                postId: newpostID,
                contributeId: contributeId
            });

            router.push(`/discuss/${newpostID}`)
        }


        toast.success(`Your have succesfully  ${postToEditId ? 'updated' : 'started'} a discussion 😎`, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2500,
        });

        window.scrollTo({ top: 0, behavior: "smooth" })
        // setSavingPost(false)
    }













    return (
        <div>
            <form id='searchdiscuss' className={styles.creatediscuss} onSubmit={handleSubmit(createDiscuss)}>
                <article>
                    <h3>Cover Image</h3>

                    <input type="file" onChange={handleCoverImageFileChange} />
                    {!selectedCoverImage && !coverImgURL &&
                        <div className='rulesdiv'>
                            <h6>1. Try as much as possible to ensure your image is in landscape or square form</h6>
                            <h6>2. If you&apos;re uploading an image you&apos;ve previously uploaded in another post, make sure to change its name before uploading.</h6>
                        </div>
                    }
                    {(selectedCoverImage || coverImgURL) && <img className={styles.uploadedimage} src={coverImgURL} alt="Preview" />}
                </article>



                <div className='inputdiv'>
                    <h3>Discuss Info</h3>
                    <label htmlFor="Title">Topic</label>
                    <input
                        id="Title" name='Title' type="text"
                        placeholder="The decline of Nigerian architecture?" defaultValue={title}
                        onChange={handleInputChange}
                        {...register("Title", { required: true })} />
                    {errors.Title && <span>This field is required</span>}
                </div>

                <div className='inputdiv'>
                    <label htmlFor="Desc">Short description of what to expect</label>
                    <textarea
                        id="Desc" name='Desc' type="text"
                        placeholder="The topic of `Nigerian Architecture's Decline` explores the factors contributing to the deterioration in the quality of architectural design and construction in Nigeria. Let's discuss and delve into issues such as inadequate urban planning, subpar construction standards, and the influence of economic constraints on architectural innovation. Join us to discuss the challenges and potential solutions for revitalizing Nigerian architecture" defaultValue={desc}
                        onChange={handleInputChange} rows={7}
                        {...register("Desc", { required: true })} />
                </div>

                <button form="searchdiscuss" type="submit" className='capsulebutton'>{postToEditId ? "Update discuss details" : "Start Discussion"}</button>
            </form>
        </div>
    )
}

export default StartDiscussion