import styles from './MakeCaseStudy.module.scss'
import Edit from "../TextEditor/Text"
import { useRef, useState, useContext, useEffect, useLayoutEffect } from "react";
import { UserContext } from '@/utils/ContextandProviders/Contexts';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useForm } from "react-hook-form";

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, collection, addDoc, updateDoc, where, query, getDoc, writeBatch, getDocs } from 'firebase/firestore';
import { db, auth, storage } from '@/utils/firebase';

import { toast } from 'react-toastify';

import { faNewspaper, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { extractImages, extractImageUrl } from '@/functions/Delete';





const MakeCaseStudy = ({ postToEditId }) => {
  const router = useRouter()

  const editorRef = useRef(null);
  const { userData, setUserData } = useContext(UserContext)
  const [caseContent, setCaseContent] = useState('') //tiny-mce content


  const [savingPost, setSavingPost] = useState(false)
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();


  const [selectedCoverImage, setSelectedCoverImage] = useState(null);
  const [previousCoverImgURL, setPreviousCoverImgURL] = useState(null)
  const [coverImgURL, setCoverImgURL] = useState(null)

  const [selectedGalleryImageFiles, setSelectedGalleryImageFiles] = useState([]);
  const [previewGalleryImageURLs, setPreviewGalleryImageURLs] = useState([]);//for display and UI
  const [originalGalleryURLs, setOriginalGalleryURLs] = useState([]);//for comparison, to check deleted images etc.
  const [updatedOriginalGalleryURLs, setUpdatedOriginalGalleryURLs] = useState([]);//for upload, to add to the newly added/uploaded images





  /////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////       IMAGE UPLOAD         /////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////
  ////////////        COVER IMAGE          //////////////////
  ///////////////////////////////////////////////////////////
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

    const imageRef = ref(storage, `cover_images/${userData.id}/Case Studies/${imageFile.name}`);
    const snapshot = await uploadBytes(imageRef, imageFile)
    const downloadURL = await getDownloadURL(snapshot.ref);
    if (postToEditId) {
      await updateDoc(doc(db, `posts/${postToEditId}`), {
        coverImageURL: downloadURL
      });
    }

    return downloadURL;
  };





  ///////////////////////////////////////////////////////////
  ////////////        GALLERY IMAGES          ///////////////
  ///////////////////////////////////////////////////////////

  const handleAddGalleryImage = (e) => {
    const selectedImages = Array.from(e.target.files);
    setSelectedGalleryImageFiles([...selectedGalleryImageFiles, ...selectedImages]);

    const selectedImagesURLs = selectedImages.map((image) => URL.createObjectURL(image));
    setPreviewGalleryImageURLs([...previewGalleryImageURLs, ...selectedImagesURLs]);
  };



  const handleRemoveGalleryImage = (index) => {

    const updatedImages = [...selectedGalleryImageFiles];
    const updatedImageURLs = [...previewGalleryImageURLs];

    updatedImages.splice(index, 1);
    updatedImageURLs.splice(index, 1);

    const removedURL = updatedImageURLs[index];
    const updatedOriginalURLs = originalGalleryURLs.filter((url) => url !== removedURL);
    setUpdatedOriginalGalleryURLs(updatedOriginalURLs)

    setSelectedGalleryImageFiles(updatedImages);
    setPreviewGalleryImageURLs(updatedImageURLs);
  };


  const uploadGalleryImages = async () => {
    const storageRef = ref(storage, `post_images/${userData.id}/Case Studies`);


    if (selectedGalleryImageFiles.length == 0) {
      return [];
    }
    else {

      try {
        const downloadURLs = await Promise.all(
          selectedGalleryImageFiles.map(async (image) => {
            const imageRef = ref(storageRef, image.name);

            try {
              const snapshot = await uploadBytes(imageRef, image);

              const downloadURL = await getDownloadURL(imageRef);
              return downloadURL;
            } catch (error) {
              toast.error('Error uploading an image', {
                position: "top-center",
                autoClose: 3000
              })
              console.error('Error uploading an image:', error);
              return null;
            }
          })
        );

        return downloadURLs
      }

      catch (error) {
        toast.error('Error uploading images', {
          position: "top-center",
          autoClose: 3000
        })
        console.error('Error uploading images:', error);
      }
    }

  };











  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  ///////////////////          CREATE OR EDIT POST         /////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  // Initial Fields Values, handle change
  const [title, setTitle] = useState('')
  const [client, setClient] = useState('')
  const [location, setLocation] = useState('')
  const [architect, setArchitect] = useState('')
  const [year, setYear] = useState('')
  const [typology, setTypology] = useState('')
  const [tags, setTags] = useState('')
  const [editorContent, setEditorContent] = useState("")
  const [createdAt, setCreatedAt] = useState("")
  const [credits, setcredits] = useState('');

  const handleInputChange = (e) => {
    setValue(e.target.name, e.target.value);
  };

  useEffect(() => {

    setValue("Title", title || "");
    setValue("Client", client || "");
    setValue("Location", location || "");
    setValue("Architect", architect || "");
    setValue("Year", year || "");
    setValue("Typology", typology || "Residential");
    setValue("Tags", tags || "");
  }, [title, client, location, architect, year, typology, tags, setValue]);





  const submitForm = async (data) => {
    document.body.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" })


    if (selectedCoverImage === null && !postToEditId) {
      toast.error("Select a cover image", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 4500,
      });
      return
    }

    setSavingPost(true)


    let coverImageDownloadURL
    if (selectedCoverImage) {
      coverImageDownloadURL = await uploadCoverImage(selectedCoverImage)
    } else coverImageDownloadURL = coverImgURL



    let galleryImagesURL = []

    if (postToEditId) {
      let deletedImages = [];

      //if new image ifiles have been selected
      if (selectedGalleryImageFiles.length > 0) {
        //if there's a post to be edited and the user is adding new images, 
        //upload the new/selected ones and add their urls to the original ones

        const uploadedGalleryImagesURL = await uploadGalleryImages()
        galleryImagesURL = [...updatedOriginalGalleryURLs, ...uploadedGalleryImagesURL]
        deletedImages = originalGalleryURLs.filter(item => !galleryImagesURL.includes(item));
      } else {
        //post to edit and no new Images, use what's already on ground
        galleryImagesURL = updatedOriginalGalleryURLs
        deletedImages = originalGalleryURLs.filter(item => !galleryImagesURL.includes(item));
      }

      deletedImages.forEach(async (image) => {
        //delete deleted gallery images from firebase
        const startIndex = image.indexOf('/o/') + 3;
        const endIndex = image.indexOf('?alt=media');
        const encodedPath = image.substring(startIndex, endIndex);
        const storagePath = decodeURIComponent(encodedPath);
        const previousImageRef = ref(storage, storagePath)
        await deleteObject(previousImageRef)
      });

    } else {
      //no post to edit so I'm uploading the selected files and then using the URls
      const uploadedGalleryImagesURL = await uploadGalleryImages()
      galleryImagesURL = uploadedGalleryImagesURL
    }


    //extract images to use for post gallery slideshow
    const postImages = await extractImages(caseContent)
    const postImagesURLs = await extractImageUrl(postImages) || []


    const postData = {
      allImages: [coverImageDownloadURL, ...postImagesURLs, ...galleryImagesURL],
      architect: data.Architect,
      authorId: userData.id,
      authorName: userData.name,
      authorAvatar: userData.profilePicture,
      authorUsername: userData.username,
      client: data.Client == '' ? 'unknown' : data.Client,
      coverImageURL: coverImageDownloadURL,
      createdAt: postToEditId ? createdAt : new Date(),
      credits: credits,
      location: data.Location.split(",").map(item => item.trim()),
      otherImages: galleryImagesURL,
      postContent: caseContent,
      postId: postToEditId ? postToEditId : userData.id,
      postType: 'Case Studies',
      tags: data.Tags.split(","),
      titleForSearch: data.Title.split(/[,:.\s-]+/).filter(word => word !== ''),
      title: data.Title,
      typology: data.Typology,
      updatedAt: postToEditId ? new Date() : "New",
      year: data.Year,
    }


    const postCollectionRef = collection(db, "posts");
    ///////////////////
    //  edited post  //
    ///////////////////
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
    }


    ///////////////////
    //   new post   //
    ///////////////////
    else {
      const newPostRef = await addDoc(postCollectionRef, postData);
      const postId = newPostRef.id
      await updateDoc(doc(postCollectionRef, newPostRef.id), {
        postId: postId
      });//updating the new post with the newly created document Id
    }

    if (postToEditId) {
      router.push(`/post/case-study/${postToEditId}`)
    } else { router.push('/?category=Case Studies') }

    toast.success(`Your case study has been ${postToEditId ? 'updated' : 'submitted'} 😎`, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 2500,
    });




    setSavingPost(false)
  }










  ////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////       CHECK IF USER WANTS TO CREATE NEW POST OR EDIT PREVIOUS POSTS       /////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////

  useLayoutEffect(() => {
    const checkPostToEdit = async () => {
      if (postToEditId == null || '' || undefined) {
        return
      }
      else {
        const postToEditRef = doc(db, `posts/${postToEditId}`)
        const postToEditSnap = await getDoc(postToEditRef)
        const postToEdit = postToEditSnap.data()
        const { coverImageURL, title, client, createdAt, credits, location, architect, year, typology, tags, postContent, otherImages } = postToEdit
        setCoverImgURL(coverImageURL)
        setPreviewGalleryImageURLs(otherImages)
        //save previously uploaded images into an array for later use [i.e the images firebase urls]
        //doing this because the new image src will be pointing to a blob file just for preview, 
        //which will later be uploaded to firebase when user submits post
        setOriginalGalleryURLs(otherImages)
        setUpdatedOriginalGalleryURLs(otherImages)
        setTitle(title)
        setClient(client)
        setCreatedAt(createdAt)
        setLocation(location.join(','))
        setArchitect(architect)
        setYear(year)
        setTypology(typology)
        setEditorContent(postContent)
        setCaseContent(postContent)
        setTags(tags.join(','))
        setcredits(credits)
      }
    }

    checkPostToEdit()
  }, [postToEditId]);























  return (
    <>
      <div className={styles.makecase}>
        <article>
          <h3>Cover Image</h3>

          <input type="file" onChange={handleCoverImageFileChange} />
          {!selectedCoverImage && !coverImgURL &&
            <div className='rulesdiv'>
              <h6>1. Try as much as possible to ensure your image is in landscape form</h6>
              <h6>2. If you&apos;re uploading an image you&apos;ve previously uploaded in another post, make sure to change its name before uploading.</h6>
            </div>
          }
          {(selectedCoverImage || coverImgURL) && <img className={styles.uploadedimage} src={coverImgURL} alt="Preview" />}
        </article>


        <form id='CaseStudy' className={styles.caseinfo} onSubmit={handleSubmit(submitForm)}>
          <h3>Case Study Info</h3>
          <div className='inputdiv'>
            <label htmlFor="Title">Title<span>*</span></label>
            <input
              id="Title" name="Title" type="text"
              placeholder="The National Theatre, Lagos: A Comprehensive Case Study" defaultValue={title}
              onChange={handleInputChange}
              {...register("Title", { required: true })} />
            {errors.Title && <span>This field is required</span>}
          </div>

          <div className='inputdiv'>
            <label htmlFor="Client">Client or Owner of the project</label>
            <input
              id="Client" name='Client' type="text"
              placeholder="Mr Agbadi Owusu" defaultValue={client}
              onChange={handleInputChange}
              {...register("Client", { required: false })} />
          </div>

          <div className='inputdiv'>
            <label htmlFor="Location">Location<span>*</span></label>
            <input id="Location" name='Location' type="text"
              placeholder="Wuse, Abuja(Please make sure it's in this format)" defaultValue={location}
              onChange={handleInputChange}
              {...register("Location", { required: true })} />
            {errors.Location && <span>This field is required</span>}
          </div>

          <div className='inputdiv'>
            <label htmlFor="Architect">Architect<span>*</span></label>
            <input id="Architect" name="Architect" type="text"
              placeholder="Bayo Amole" defaultValue={architect}
              onChange={handleInputChange}
              {...register("Architect", { required: true })} />
            {errors.Architect && <span>This field is required</span>}
          </div>

          <div className='inputdiv'>
            <label htmlFor="Year">Year<span>*</span></label>
            <input id="Year" name='Year' type="text"
              placeholder="2022" defaultValue={year}
              onChange={handleInputChange}
              {...register("Year", { required: true })} />
            {errors.Year && <span>This field is required</span>}
          </div>

          <div className='inputdiv'>
            <label htmlFor="Typology">Typology<span>*</span></label>
            <select id='Typology' name='Typology'
              onChange={handleInputChange} defaultValue={typology}
              {...register("Typology")}>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Civic and Government">Civic and Government</option>
              <option value="Institutional">Institutional</option>
              <option value="Cultural and Recreational">Cultural and Recreational</option>
              <option value="Industrial">Industrial</option>
              <option value="Religious">Religious</option>
              <option value="Transportation">Transportation </option>
              <option value="Hospitality">Hospitality</option>
              <option value="Educational">Educational </option>
              <option value="Mixed Use">Mixed Use </option>
            </select>
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
        <Edit editorRef={editorRef} editorContent={editorContent} setContent={setCaseContent} type={"Case Studies"} />


        <section className={styles.galleryimages}>
          <h3>Other Images</h3>
          <div className='rulesdiv'>
            <h6>1. You can select multiple images at once, or select one by one. Once again, make sure your images are high resolution images but not too big in file sizes.</h6>
            <h6>2. It&apos;s best to properly name each image to avoid conflicts. Also if you&apos;re uploading a copy of the cover image here, duplicate and change its name before uploading.</h6>
            <h6>3. If you&apos;re uploading an image you&apos;ve previously uploaded in another post, make sure to change its name before uploading.</h6>
          </div>
          <input type="file" multiple onChange={handleAddGalleryImage} />
          <div className={styles.imagepreviewcontainer}>
            {previewGalleryImageURLs?.map((url, index) => (
              <div key={index} className={styles.imagepreview}>
                <img src={url} alt={`Image ${index}`} />
                <span className={styles.closebutton} onClick={() => handleRemoveGalleryImage(index)} title='Remove Image'>
                  <FontAwesomeIcon icon={faX} />
                </span>
              </div>
            ))}
          </div>
        </section>


        <div className={`inputdiv ${styles.inputdiv}`}>
          <label htmlFor="Credits">Credits and references</label>
          <input
            id="Credits" name="Credits" type="text" onChange={(e) => setcredits(e.target.value)}
            value={credits} placeholder="All images from google.com" />
        </div>

        <button className={styles.submitbutton} form='CaseStudy' type="submit">{postToEditId ? "Update" : "Submit"} your Case Study <FontAwesomeIcon icon={faNewspaper} /></button>



        {
          savingPost &&
          <div className='saving'>
            <span>Saving Post...this might take a while</span>
            <span>Please do not close tab.</span>
          </div>
        }
      </div>



    </>
  )
}

export default MakeCaseStudy