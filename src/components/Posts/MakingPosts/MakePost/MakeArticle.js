import styles from './MakeArticle.module.scss'
import Edit from "../TextEditor/Text"
import { useRef, useState, useContext, useEffect, useLayoutEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useForm } from "react-hook-form";

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, collection, addDoc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth, storage } from '@/utils/firebase';

import { toast } from 'react-toastify';


const MakeArticle = ({ postToEditId }) => {
  const router = useRouter()
  const editorRef = useRef(null);
  const [submit, setSubmit] = useState(false)
  const [user, loading] = useAuthState(auth)
  const [articleContent, setArticleContent] = useState('') //tiny-mce content
  const [selectedImage, setSelectedImage] = useState(null);
  const [coverImgURL, setCoverImgURL] = useState(null)
  const [savingPost, setSavingPost] = useState(false)
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();


  // Initial Form Fields Values, handle change
  const [title, setTitle] = useState('')
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







  const submitForm = async (data) => {
    setSubmit(true)

    if (selectedImage === null && !postToEditId) {
      toast.error("Select a cover image", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 4500,
      });
      return
    }

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
      createdAt: new Date(),
      postContent: articleContent,
      postId: postToEditId ? postToEditId : user.uid,
      postType: 'Articles',
      tags: data.Tags.split(","),
      title: data.Title,
      timeToRead: data.TimeToRead,
    }

    const postCollectionRef = collection(db, "posts");
    if (postToEditId) {
      await updateDoc(doc(postCollectionRef, postToEditId), postData);
    } else {
      const newPostRef = await addDoc(postCollectionRef, postData);
      const postId = newPostRef.id
      await updateDoc(doc(postCollectionRef, newPostRef.id), {
        postId: postId
      });
    }

    toast.success(`Your article has been ${postToEditId ? 'updated' : 'posted'} 😎`, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3500,
    });

    router.push('/')
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
        const { title, desc, timeToRead, tags, postContent, coverImageURL } = postToEdit
        setCoverImgURL(coverImageURL)
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
  ///////////////////////////////////////////////////////////
  ////////////       IMAGE UPLOAD         //////////////////
  ///////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);

    if (postToEditId) {
      //delete previous image from firebase
      const startIndex = coverImgURL.indexOf('/o/') + 3;
      const endIndex = coverImgURL.indexOf('?alt=media');
      const encodedPath = coverImgURL.substring(startIndex, endIndex);
      const storagePath = decodeURIComponent(encodedPath);
      const previousImageRef = ref(storage, storagePath)
      await deleteObject(previousImageRef)
    }

    const newImgURL = URL.createObjectURL(file)
    setCoverImgURL(newImgURL)

  };

  //upload selected image to firebase
  const uploadImage = async (imageFile) => {
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









  return (
    <div className={styles.makearticle}>
      <article className='ImageUploader'>
        <input type="file" onChange={handleImageUpload} /> <h6>Please make sure your image is in landscape form</h6>
        {postToEditId && <img className={styles.uploadedimage} src={coverImgURL} alt="Preview" />}
        {(selectedImage && coverImgURL) && <img className={styles.uploadedimage} src={coverImgURL} alt="Preview" />}
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
            {...register("TimeToRead", { required: true })} />
          {errors.TimeToRead && <span>This field is required</span>}
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
      <Edit submit={submit}
        editorRef={editorRef} editorContent={editorContent} setContent={setArticleContent} />


      <button className={styles.submitbutton} form='Article' type="submit">Submit your Case Study 📒</button>
    </div>
  )
}

export default MakeArticle