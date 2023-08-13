import styles from './MakeArticle.module.scss'
import Edit from "../TextEditor/Text"
import { useRef, useState, useContext, useEffect, useLayoutEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useForm } from "react-hook-form";

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, collection, addDoc, updateDoc, setDoc, getDoc, writeBatch, getDocs, query, where } from 'firebase/firestore';
import { db, auth, storage } from '@/utils/firebase';

import { toast } from 'react-toastify';


const MakeArticle = ({ postToEditId }) => {
  const router = useRouter()
  const editorRef = useRef(null);
  const [user, loading] = useAuthState(auth)
  const [articleContent, setArticleContent] = useState('') //tiny-mce content
  const [selectedImage, setSelectedImage] = useState(null);
  const [coverImgURL, setCoverImgURL] = useState(null)
  const [previousCoverImgURL, setPreviousCoverImgURL] = useState(null)
  const [savingPost, setSavingPost] = useState(false)
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();


  // Initial Form Fields Values, handle change
  const [title, setTitle] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [desc, setDesc] = useState('')
  const [timeToRead, setTimeToRead] = useState('')
  const [tags, setTags] = useState('')
  const [editorContent, setEditorContent] = useState("")
  const handleInputChange = (e) => {
    setValue(e.target.name, e.target.value);
  };
  useEffect(() => {
    setValue("Title", title || "");
    setValue("Desc", desc || "");
    setValue("TimeToRead", timeToRead || "");
    setValue("Tags", tags || "");
  }, [title, desc, timeToRead, tags]);








  ///////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  ////////////       MAKE-EDIT POST         //////////////////
  ///////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////

  const submitForm = async (data) => {
    document.body.scrollTo({ top: 0, behavior: "smooth" });

    if (selectedImage === null && !postToEditId) {
      toast.error("Select a cover image", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 4500,
      });
      return
    }
    setSavingPost(true)

    let downloadURL
    if (selectedImage) {
      downloadURL = await uploadImage(selectedImage)
    } else downloadURL = coverImgURL


    const postData = {
      authorId: user.uid,
      authorName: user.displayName,
      authorAvatar: user.photoURL,
      desc: data.Desc,
      coverImageURL: downloadURL,
      createdAt: postToEditId ? createdAt : new Date(),
      postContent: articleContent,
      postId: postToEditId ? postToEditId : user.uid,
      postType: 'Articles',
      tags: data.Tags.split(","),
      title: data.Title,
      timeToRead: data.TimeToRead,
      updatedAt: new Date()
    }

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
          postTitle: data.Title,
          postCoverPhoto: downloadURL
        })
      })


      await batch.commit();


    } else {
      const newPostRef = await addDoc(postCollectionRef, postData);
      const postId = newPostRef.id
      await updateDoc(doc(postCollectionRef, newPostRef.id), {
        postId: postId
      });
    }

    router.push('/')
    toast.success(`Your article has been ${postToEditId ? 'updated' : 'posted'} 😎`, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3500,
    });
    
    setSavingPost(false)
  }






  ////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////       CHECK IF USER WANTS TO CREATE NEW POST OR EDIT PREVIOUS POSTS       //////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////

  useLayoutEffect(() => {
    const checkPostToEdit = async () => {
      if (postToEditId == null || '' || undefined) {
        return
      }
      else {
        const postToEditRef = doc(db, `posts/${postToEditId}`)
        const postToEditSnap = await getDoc(postToEditRef)
        const postToEdit = postToEditSnap.data()
        const { title, desc, timeToRead, tags, postContent, createdAt, coverImageURL } = postToEdit
        setCoverImgURL(coverImageURL)
        setCreatedAt(createdAt)
        setTitle(title)
        setDesc(desc)
        setTimeToRead(timeToRead)
        setEditorContent(postContent)
        setTags(tags.join(','))

      }
    }
    checkPostToEdit()
  }, [postToEditId]);





  ///////////////////////////////////////////////////////////
  ////////////       IMAGE UPLOAD         //////////////////
  ///////////////////////////////////////////////////////////
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (postToEditId) {
      setPreviousCoverImgURL(coverImgURL)
    }

    setSelectedImage(file);
    const newImgURL = URL.createObjectURL(file)
    setCoverImgURL(newImgURL)

  };

  //upload selected image to firebase
  const uploadImage = async (imageFile) => {
    if (postToEditId) {
      //delete previous image from firebase
      const startIndex = previousCoverImgURL.indexOf('/o/') + 3;
      const endIndex = previousCoverImgURL.indexOf('?alt=media');
      const encodedPath = previousCoverImgURL.substring(startIndex, endIndex);
      const storagePath = decodeURIComponent(encodedPath);
      const previousImageRef = ref(storage, storagePath)
      await deleteObject(previousImageRef)
    }

    const imageRef = ref(storage, `cover_images/${user.uid}/Articles/${imageFile.name}`);
    const snapshot = await uploadBytes(imageRef, imageFile)
    const downloadURL = await getDownloadURL(snapshot.ref);
    if (postToEditId) {
      await updateDoc(doc(db, `posts/${postToEditId}`), {
        coverImageURL: downloadURL
      });
    }

    return downloadURL;
  };



  const checkIfNumberInRange = async (num) => {
    if (num > 15) {
      return false
    } else {
      return true
    }
  };





  


  return (
    <>

      {
        savingPost &&
        <div className={styles.saving}>
          Saving Post...
        </div>
      }
      <div className={styles.makearticle}>
        <article className='ImageUploader'>
          <input type="file" onChange={handleImageUpload} />
          {!selectedImage && <h6>Please make sure your image is in landscape form</h6>}
          {(selectedImage || coverImgURL) && <img className={styles.uploadedimage} src={coverImgURL} alt="Preview" />}
        </article>


        <form id='Article' className={styles.articleinfo} onSubmit={handleSubmit(submitForm)}>
          <h3>Article Info</h3>

          <div className='inputdiv'>
            <label htmlFor="Title">Title<span>*</span></label>
            <input
              id="Title" name="Title" type="text"
              placeholder="The National Theatre, Lagos: A Comprehensive Case Study"
              onChange={handleInputChange}
              {...register("Title", { required: true })} />
            {errors.Title && <span>This field is required</span>}
          </div>

          <div className='inputdiv'>
            <label htmlFor="Desc">Short Description/Excerpt<span>*</span></label>
            <textarea
              id="Desc" name='Desc' type="text"
              placeholder="Mr Agbadi Owusu" defaultValue={desc}
              onChange={handleInputChange} rows={3}
              {...register("Desc", { required: false })} />
          </div>

          <div className='inputdiv'>
            <label htmlFor="TimeToRead">Time To Read(mins)<span>*</span></label>
            <input id="TimeToRead" name='TimeToRead' type="text"
              placeholder="2" defaultValue={timeToRead}
              onChange={handleInputChange}
              {...register("TimeToRead", {
                required: true,
                pattern: {
                  value: /^[0-9]+$/,
                  message: 'Field can only contain numbers',
                },
                validate: checkIfNumberInRange

              })} />
            {errors.TimeToRead && errors.TimeToRead.type === 'required' && (
              <span>Time To Read field is required</span>
            )}
            {errors.TimeToRead && errors.TimeToRead.type === 'pattern' && (
              <span>Time To Read can only be a number</span>
            )}
            {errors.TimeToRead && errors.TimeToRead.type === 'validate' && (
              <span>Time To Read can only be a number between 0 - 15</span>
            )}
          </div>

          <div className='inputdiv'>
            <label htmlFor="Tags">Tags<span>*</span></label>
            <input id="Tags" name='Tags' type="text"
              onChange={handleInputChange} defaultValue={tags}
              placeholder="Tags e.g 'modern, residential, sustainable architecture'"
              {...register("Tags", { required: true })} />
            {errors.Tags && <span>This field is required</span>}
          </div>

        </form>

        {/* TinyMCE RTE */}
        <Edit editorRef={editorRef} editorContent={editorContent} setContent={setArticleContent} />


        <button className={styles.submitbutton} form='Article' type="submit">Post your Article 📒</button>
      </div>
    </>

  )
}

export default MakeArticle