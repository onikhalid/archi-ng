import styles from './MakeCaseStudy.module.scss'
import Edit from "../TextEditor/Text"
import { useRef, useState, useContext, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useForm } from "react-hook-form";
import { SubmitContext, ThemeContext } from '@/utils/ContextandProviders/Contexts';
import { ImageUploader } from '../ImageUploader/ImageUploader';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, collection, addDoc, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, auth, storage } from '@/utils/firebase';

import { toast } from 'react-toastify';


const MakeCaseStudy = ({ postToEditId }) => {
  const router = useRouter()
  const editorRef = useRef(null);
  const [submit, setSubmit] = useState(false)
  const [user, loading] = useAuthState(auth)
  const [caseContent, setCaseContent] = useState('') //tiny-mce content
  const [selectedImage, setSelectedImage] = useState(null);
  const [coverImgURL, setCoverImgURL] = useState(null)
  const [savingPost, setSavingPost] = useState(false)
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();



  // Initial Fields Values, handle change
  const [title, setTitle] = useState('')
  const [client, setClient] = useState('')
  const [location, setLocation] = useState('')
  const [architect, setArchitect] = useState('')
  const [year, setYear] = useState('')
  const [typology, setTypology] = useState('')
  const [tags, setTags] = useState('')
  const [editorContent, setEditorContent] = useState("")
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
  }, [title, client, location, architect, year, typology, tags]);















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
      architect: data.Architect,
      authorId: user.uid,
      authorName: user.displayName,
      authorAvatar: user.photoURL,
      client: data.Client == '' ? 'unknown' : data.Client,
      coverImageURL: downloadURL,
      createdAt: new Date(),
      location: data.Location,
      postContent: caseContent,
      postId: postToEditId ? postToEditId : user.uid,
      postType: 'Case Studies',
      tags: data.Tags.split(","),
      title: data.Title,
      typology: data.Typology,
      year: data.Year,
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
  const checkPostToEdit = async () => {
    if (postToEditId == null || '' || undefined) {
      return
    }
    else {
      const postToEditRef = doc(db, `posts/${postToEditId}`)
      const postToEditSnap = await getDoc(postToEditRef)
      const postToEdit = postToEditSnap.data()
      const { coverImageURL, title, client, location, architect, year, typology, tags, postContent } = postToEdit
      setCoverImgURL(coverImageURL)
      setTitle(title)
      setClient(client)
      setLocation(location)
      setArchitect(architect)
      setYear(year)
      setTypology(typology)
      setEditorContent(postContent)
      setTags(tags.join(','))
    }
  }
  useEffect(() => {
    checkPostToEdit()
  }, []);




  ///////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  ////////////       IMAGE UPLOAD         //////////////////
  ///////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////

  // select local file
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


    const newImgURL = selectedImage && URL.createObjectURL(selectedImage)
    setCoverImgURL(newImgURL)

  };

  //upload selected image to firebase
  const uploadImage = async (imageFile) => {
    const imageRef = ref(storage, `cover_images/${user.uid}/Case Studies/${imageFile.name}`);
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
    <div className={styles.makecase}>
      <article>
        <input type="file" onChange={handleImageUpload} /> <h6>Please make sure your image is in landscape form</h6>
        {postToEditId && <img className={styles.uploadedimage} src={coverImgURL} alt="Preview" />}
        {selectedImage&&coverImgURL && <img className={styles.uploadedimage} src={coverImgURL} alt="Preview" />}
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
            placeholder="Wuse, Abuja" defaultValue={location}
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
      <Edit submit={submit}
        editorRef={editorRef} editorContent={editorContent} setContent={setCaseContent} />


      <button className={styles.submitbutton} form='CaseStudy' type="submit">Submit your Case Study 📒</button>
    </div>
  )
}

export default MakeCaseStudy