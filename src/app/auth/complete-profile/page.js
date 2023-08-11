"use client"
import styles from "./complete-profile.module.scss"
import { useRouter } from "next/navigation";
import { useState, useEffect, useLayoutEffect } from "react";
import { useForm } from "react-hook-form";
import { db, auth, storage } from '@/utils/firebase';
import { updateProfile } from "firebase/auth";
import { useAuthState } from 'react-firebase-hooks/auth';
import { getMetadata, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, collection, updateDoc, getDoc, setDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import Button from "@/components/Button/button";
import { toast } from "react-toastify";

const Page = () => {
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm();
  const [user, loading] = useAuthState(auth)
  const router = useRouter()
  const [savingProfile, setSavingProfile] = useState(false)
  const [pictureURL, setPictureURL] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const newUserPic = "/assets/logo/logo-light.svg"




  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////
  ///////////////       PREPOPULATE FORM     //////////////////
  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////
  // form fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [username, setuserName] = useState('');
  const [occupation, setOccupation] = useState([]);

  const handleInputChange = (e) => {
    setValue(e.target.name, e.target.value);
  };
  useEffect(() => {
    setValue("Name", name || "");
    setValue("Bio", bio || "");
    setValue("Username", username || "");
    setValue("Occupation", occupation || "");
  }, [name, bio, username, occupation]);



  //Get User Info to prepopulate the form with
  useLayoutEffect(() => {
    const GetUserInfo = async () => {
      if (!loading) {
        const userProfileRef = doc(db, `users/${user?.uid}`)
        const userProfileSnap = await getDoc(userProfileRef)
        const userData = userProfileSnap.data()

        const { name, username, bio, profilePicture, occupation } = userData

        setPictureURL(profilePicture)
        setName(name)
        setuserName(username)
        setBio(bio)
        setOccupation(occupation)
      }


    }
    GetUserInfo()
  }, [user, loading]);







  //////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////
  //////////////////      FORM SUBMISSION        ///////////////////////
  //////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////

  // check If Username Is Taken
  const checkIfUsernameTaken = async (username) => {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    let userWithUserName
    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      userWithUserName = data
    });
    if (user.uid == userWithUserName?.id) {
      return true
    } else return querySnapshot.empty;
  };



  //////////////////////////////////////////////////////////////////////
  //////////////////      UPDATE PROFILE        ///////////////////////
  const createOrUpdateProfile = async (data) => {
    const newImageURL = selectedImage && await uploadImage(selectedImage)

    const userData = {
      id: user?.uid,
      name: data.Name,
      username: data.Username,
      bio: data.Bio,
      profilePicture: selectedImage ? newImageURL : pictureURL,
      occupation: data.Occupation
    }

    const userDocRef = doc(db, `users/${user?.uid}`);
    await setDoc(userDocRef, { ...userData });
    await updateProfile(user, { photoURL: selectedImage ? newImageURL : pictureURL, displayName: data.Name })
    const batch = writeBatch(db);



    //////////////////////////////////////////////////////////////////////////////////
    /////   UPDATE NAME AND AVATAR IN POSTS USER HAS PREVIOUSLY CREATED/FEATURED IN
    /////  POSTS
    const allUsersPostsQuery = query(collection(db, 'posts'), where('authorId', '==', user?.uid));
    const allUsersPostsSnap = await getDocs(allUsersPostsQuery)

    allUsersPostsSnap.docs.forEach(async (posts) => {
      const post = posts.data();
      const postDocRef = doc(db, `posts/${post.postId}`)

      batch.update(postDocRef, {
        authorName: data.Name,
        authorAvatar: selectedImage ? newImageURL : pictureURL
      })
    })


    /////  BOOKMARKS
    const allUsersPostsBookmarkssQuery = query(collection(db, 'bookmarks'), where('authorId', '==', user?.uid));
    const allUsersPostsBookmarksSnap = await getDocs(allUsersPostsBookmarkssQuery)
    allUsersPostsBookmarksSnap.docs.forEach(async (allBookmarks) => {
      const bookmark = allBookmarks.data();
      const bookmsrkDocRef = doc(db, `bookmarks/${bookmark.bookmarkId}`)

      batch.update(bookmsrkDocRef, {
        postAuthorName: data.Name,
        postAuthorPhoto: selectedImage ? newImageURL : pictureURL
      })
    });


    /////  FOLDERS
    const allUsersFoldersQuery = query(collection(db, 'folders'), where('userId', '==', user?.uid));
    const allUsersFoldersSnap = await getDocs(allUsersFoldersQuery)
    allUsersFoldersSnap.docs.forEach(async (allFolders) => {
      const folder = allFolders.data();
      const folderDocRef = doc(db, `folders/${folder.folderId}`)

      batch.update(folderDocRef, {
        folderOwnerName: data.Name,
        folderOwnerAvatar: selectedImage ? newImageURL : pictureURL
      })
    });

    await batch.commit();


    toast.success("Profile updated successfully", {
      position: 'top-center',
      autoClose: 2000,
    })

    router.push('/')
  }






  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////
  ///////////////////     IMAGE UPLOAD     ////////////////////
  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////
  // Check if profile picture exists
  async function checkFileExists(picRef) {
    try {
      await getMetadata(picRef);
      return true;
    } catch (error) {
      if (error.code === 'storage/object-not-found') {
        return false;
      }
      throw error;
    }
  }


  // select local file image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);

    const newImgPreviewURL = URL.createObjectURL(file)
    setPictureURL(newImgPreviewURL)
  };


  //upload selected image to firebase
  const uploadImage = async (imageFile) => {

    const picRef = ref(storage, `profile_pictures/authorized_users/pic_${user?.uid}.jpg`);
    const fileExists = await checkFileExists(picRef);

    if (fileExists) {
      await deleteObject(picRef)
    }

    const snapshot = await uploadBytes(picRef, imageFile)
    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log(downloadURL)

    return downloadURL;
  };





  





  return (
    <>
    <title>Edit Profile | archi NG</title>
      {
        loading && <div>Loading..</div>
      }
      {
        user && <div className={styles.userDetails}>
          <h1>Complete your profile</h1>

          <article className={styles.imagecontainer}>
            <input type="file" accept="image/jpeg, image/jpg, image/png, image/gif" onChange={handleImageUpload} />
            {pictureURL && <img className={styles.picture} src={pictureURL || newUserPic} alt="Preview" />}
          </article>
          <form id='userDetails' className={styles.userInfoForm} onSubmit={handleSubmit(createOrUpdateProfile)}>
            <div className={styles.inputdiv}>
              <label htmlFor="Name">Full name<span>*</span></label>
              <input id="Name" type="text" name="Name"
                placeholder="Adanna Nwoku Elizabeth" onChange={handleInputChange}
                {...register("Name", { required: true })} />
              {errors.Name && <span>Full Name field is required</span>}
            </div>
            <div className={styles.inputdiv}>
              <label htmlFor="Bio">About me<span>*</span></label>
              <textarea name="Bio" rows="3" maxLength="150" onChange={handleInputChange}
                placeholder="Write a little about yourself" {...register("Bio", { required: true })}></textarea>
              {errors.Bio && <span>About me field is required</span>}
            </div>

            <div className={styles.inputdiv}>
              <label htmlFor="Username">Username<span>*</span></label>
              <input id="Username" type="text" name="Username"
                placeholder="Choose a unique username" onChange={handleInputChange}
                {...register("Username", {
                  required: true,
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Field can only contain letters, numbers and underscores',
                  },
                  validate: checkIfUsernameTaken
                })}
              />
              {errors.Username && errors.Username.type === 'required' && (
                <span>Username is required</span>
              )}
              {errors.Username && errors.Username.type === 'pattern' && (
                <span>Username must only contain letters</span>
              )}
              {errors.Username && errors.Username.type === 'validate' && (
                <span>Username taken, please choose something else</span>
              )}
            </div>

            <div>
              <label htmlFor="occupation">Occupation</label>
              <select id="occupation" name="Occupation"
                onChange={handleInputChange}
                {...register("Occupation")}>
                <option value="Architecture: Firm">Architecture: Firm</option>
                <option value="Architecture: Freelancer">Architecture: Freelancer / Freelancer</option>
                <option value="Architecture: Construction / Real Estate">Architecture: Construction / Real Estate</option>
                <option value="Architecture: Academic Organization">Architecture: Academic Organization</option>
                <option value="Architecture: Student">Architecture: Student</option>
                <option value="Landscape">Landscape</option>
                <option value="Urban Designer">Urban Designer</option>
                <option value="Interior Designer">Interior Designer</option>
                <option value="Graphic Designer">Graphic Designer</option>
                <option value="Photographer">Photographer</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Engineering">Engineering</option>
                <option value="Media / PR Agency">Media / PR Agency</option>
                <option value="Other">Other</option>
              </select>
            </div>



          </form>

          <div className={styles.buttongroup}>
            {/* <Button name='Skip ⏭' type='primary' link='/' /> */}
            <button className={styles.submitbutton} form='userDetails' type="submit">Save and Continue ▶</button>

          </div>
        </div>
      }
    </>
  )
}

export default Page