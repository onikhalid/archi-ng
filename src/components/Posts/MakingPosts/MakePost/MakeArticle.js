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
import { UserContext } from '@/utils/ContextandProviders/Contexts';


const MakeArticle = ({ postToEditId }) => {
  const router = useRouter()
  const editorRef = useRef(null);
  const { userData, setUserData } = useContext(UserContext);
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
  }, [title, desc, timeToRead, tags, setValue]);








  ///////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  ////////////       MAKE-EDIT POST         //////////////////
  ///////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////

  const submitForm = async (data) => {

    document.body.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" })


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
      authorId: userData.id,
      authorName: userData.name,
      authorAvatar: userData.profilePicture,
      authorUsername: userData.username,
      desc: data.Desc,
      coverImageURL: downloadURL,
      createdAt: postToEditId ? createdAt : new Date(),
      postContent: articleContent,
      postId: postToEditId ? postToEditId : userData.id,
      postType: 'Articles',
      tags: data.Tags.split(","),
      title: data.Title,
      titleForSearch: data.Title.split(/[,:.\s-]+/).filter(word => word !== ''),
      timeToRead: data.TimeToRead,
      updatedAt: postToEditId ? new Date() : "New"
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

    if (postToEditId) {
      router.push(`/post/article/${postToEditId}`)
      
    } else {
      router.push('/?category=Articles')
    }

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
        setArticleContent(postContent)
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

    const imageRef = ref(storage, `cover_images/${userData.id}/Articles/${imageFile.name}`);
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


      <div className={styles.makearticle}>

        <article className='ImageUploader'>
          <input type="file" onChange={handleImageUpload} />
          {!selectedImage && !coverImgURL &&
            <div className='rulesdiv'>
              <h6>1. Try as much as possible to ensure your image is in landscape form</h6>
              <h6>2. If you&apos;re uploading an image you&apos;ve previously uploaded in another post, make sure to change its name before uploading.</h6>
            </div>
          }
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
              id="Desc" name='Desc' type="text" maxLength={160}
              placeholder="A site plan is a drawing that shows the layout of a property, including the location of buildings, roads, sidewalks, landscaping, and other features." defaultValue={desc}
              onChange={handleInputChange} rows={2}
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
        <Edit editorRef={editorRef} editorContent={editorContent} setContent={setArticleContent} type={"Articles"} />


        <button className={styles.submitbutton} form='Article' type="submit">{postToEditId ? "Update" : "Post"} your Article</button>




 
        {
          savingPost &&
          <div className='saving'>
            <span>Saving Post...this might take a while</span>
             <span>Please do not close this tab.</span>
          </div>
        }
      </div>
    </>

  )
}

export default MakeArticle