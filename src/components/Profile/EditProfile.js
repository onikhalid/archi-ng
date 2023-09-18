"use client"
import styles from "./EditProfile.module.scss"
import { useRouter } from "next/navigation";
import { useState, useEffect, useLayoutEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import { db, auth, storage } from '@/utils/firebase';
import { updateProfile } from "firebase/auth";
import { useAuthState } from 'react-firebase-hooks/auth';
import { getMetadata, getDownloadURL, ref, uploadBytes, deleteObject } from "firebase/storage";
import { doc, collection, setDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faBehance, faInstagram, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { UserContext } from "@/utils/ContextandProviders/Contexts";

const EditProfile = ({ save, update }) => {
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm();
  const [user, loading] = useAuthState(auth)
  const router = useRouter()

  const [savingProfile, setSavingProfile] = useState(false)
  const [pictureURL, setPictureURL] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const newUserPic = "/assets/img/unknown_user_profile_picture.png"
  const { userData } = useContext(UserContext);



  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////
  ///////////////       PREPOPULATE FORM     //////////////////
  /////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////
  // form fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [username, setuserName] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [behance, setBehance] = useState('');
  const [mail, setMail] = useState('');
  const [occupation, setOccupation] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValue(name, value);

    if (name == "Bio") {
      setBio(value)
    }
  };

  useEffect(() => {
    setValue("Name", name || "");
    setValue("Bio", bio || "");
    setValue("Username", username || "");
    setValue("Occupation", occupation || "");
    setValue("Twitter", twitter || "");
    setValue("Instagram", instagram || "");
    setValue("Behance", behance || "");
    setValue("Mail", mail || "");
  }, [name, bio, username, occupation, twitter, instagram, behance, mail]);



  //Get User Info to prepopulate the form with
  useLayoutEffect(() => {
    const GetUserInfo = async () => {
      if (!loading) {
        //use already collected info from user context
        const { name, username, bio, profilePicture, occupation, twitter, instagram, behance, mail } = userData

        setPictureURL(profilePicture)
        setName(name)
        setuserName(username)
        setBio(bio)
        setOccupation(occupation)

        setTwitter(twitter)
        setInstagram(instagram)
        setBehance(behance)
        setMail(mail)

      }

    }

    GetUserInfo()
  }, [user, loading]);







  /////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////
  //////////////////      VALIDATE USERNAME AVAILABILITY        ///////////////////////
  ////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////

  // check If Username Is Taken
  const checkIfUsernameTaken = async (username) => {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);

    let userWithUserName
    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      userWithUserName = data
    });
    if (user.uid === userWithUserName.id) {
      return true
    } else return querySnapshot.empty;
  };


  /////////////////////////////////////////////////////////////
  ///////////////////     IMAGE UPLOAD     ////////////////////
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

    return downloadURL;
  };








  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////      UPDATE PROFILE        ////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  const createOrUpdateProfile = async (data) => {
    document.body.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" })

    setSavingProfile(true)


    const newImageURL = selectedImage && await uploadImage(selectedImage)
    const userData = {
      id: user?.uid,
      name: data.Name,
      username: data.Username,
      bio: data.Bio,
      profilePicture: selectedImage ? newImageURL : pictureURL,
      occupation: data.Occupation,

      twitter: data.Twitter,
      instagram: data.Instagram,
      behance: data.Behance,
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
        authorAvatar: selectedImage ? newImageURL : pictureURL,
        authorUsername: data.Username
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



    /////  CONTRIBUTIONS
    const allUsersContributionsQuery = query(collection(db, 'contributions'), where('authorId', '==', user?.uid));
    const allUsersContributionSnap = await getDocs(allUsersContributionsQuery)

    allUsersContributionSnap.docs.forEach(async (allContributions) => {
      const contribution = allContributions.data();
      const contributionDocRef = doc(db, `contributions/${contribution.contributeId}`)

      batch.update(contributionDocRef, {
        authorName: data.Name,
        authorPhoto: selectedImage ? newImageURL : pictureURL,
        authorUsername: data.Username
      })
    });

    await batch.commit();


    toast.success("Profile updated successfully", {
      position: 'top-center',
      autoClose: 2000,
    })

    if (update) {
      router.push(`/`)

    } else {
      router.push(`/profile/${username}`)

    }
    setSavingProfile(false)

  }
















  return (
    <>
      {
        loading && <div>Loading..</div>
      }

{
        savingProfile &&
        <div className='saving'>
          Saving Profile...this might take a while<br /> Please do not close tab.
        </div>
      }

      {
        user && <div className={styles.userDetails}>

          <form id='userDetails' className={styles.Form} onSubmit={handleSubmit(createOrUpdateProfile)}>

            <section className={styles.userinfosection}>
              <h5>User Info</h5>

              <article className={styles.imagecontainer}>
                <input type="file" accept="image/jpeg, image/jpg, image/png, image/gif" onChange={handleImageUpload} />
                {pictureURL && <img className={styles.picture} src={pictureURL || newUserPic} alt="Preview" />}
              </article>
              <div className={styles.inputdiv}>
                <label htmlFor="Name">Full name<span>*</span></label>
                <input id="Name" type="text" name="Name"
                  placeholder="Adanna Nwoku Elizabeth" onChange={handleInputChange}
                  {...register("Name", { required: true })} />
                {errors.Name && <span>Full Name field is required</span>}
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
                  <span>Username must only contain letters, numbers or underscores</span>
                )}
                {errors.Username && errors.Username.type === 'validate' && (
                  <span>Username not available, please choose something else</span>
                )}
              </div>

              <div className={styles.inputdiv}>
                <label htmlFor="Bio">Bio<span>*</span></label>
                <textarea name="Bio" rows="3" maxLength="250" onChange={handleInputChange}
                  placeholder="Write a little about yourself" {...register("Bio", { required: true })}></textarea>
                <span>{`/250`}</span>
                {errors.Bio && <span>About me field is required</span>}
              </div>

              <div>
                <label htmlFor="occupation">Occupation/Category</label>
                <select id="occupation" name="Occupation"
                  onChange={handleInputChange}
                  {...register("Occupation")}>

                  <optgroup label="Architecture">
                    <option value="Architecture: Student">Architecture: Student</option>
                    <option value="Architecture: Licensed Professional">Architecture: Licensed Professional</option>
                    <option value="Architecture: Licensed Professional">Architecture: Educator</option>
                    <option value="Architecture: Design Firm">Architecture: Design Firm</option>
                    <option value="Architecture: Academic Organization">Architecture: Academic Organization</option>
                  </optgroup>

                  <optgroup label="Construction">
                    <option value="Construction: Construction Firm">Construction: Construction Firm</option>
                    <option value="Construction: Engineer">Construction: Engineer</option>
                  </optgroup>

                  <optgroup label="Real Estate">
                    <option value="Real Estate: Agent">Real Estate: Agent</option>
                    <option value="Real Estate: Property Developer">Real Estate: Property Developer</option>
                  </optgroup>

                  <optgroup label="Others">
                    <option value="Architectural Enthusiast">Architectural Enthusiast</option>
                    <option value="Architectural Critic">Architectural Critic</option>
                    <option value="Photographer"> Photographer</option>
                    <option value="Urban Designer">Urban Designer</option>
                  </optgroup>

                </select>
              </div>
            </section>


            <section className={styles.usersocialssection}>
              <h5>Socials</h5>

              <div className={styles.inputdiv}>
                <label htmlFor="Twitter">Twitter <FontAwesomeIcon icon={faTwitter} /></label>
                <input id="Twitter" type="text" name="Twitter"
                  placeholder="https://www.twitter.com/archi-ng" onChange={handleInputChange}
                  {...register("Twitter", {
                    required: false,
                    pattern: {
                      value: /(https?|ftp):\/\/[^\s/$.?#].[^\s]*/i,
                      message: 'Field can only contain urls with "https://..."',
                    }
                  })}
                />
              </div>

              <div className={styles.inputdiv}>
                <label htmlFor="Instagram">Instagram <FontAwesomeIcon icon={faInstagram} /> </label>
                <input id="Instagram" type="text" name="Instagram"
                  placeholder="https://www.instagram.com/archi-ng" onChange={handleInputChange}
                  {...register("Instagram", {
                    required: false,
                    pattern: {
                      value: /(https?|ftp):\/\/[^\s/$.?#].[^\s]*/i,
                      message: 'Field can only contain urls with "https://..."',
                    }
                  })}
                />
              </div>

              <div className={styles.inputdiv}>
                <label htmlFor="Behance">Behance <FontAwesomeIcon icon={faBehance} /> </label>
                <input id="Behance" type="text" name="Behance"
                  placeholder="https://www.behance.net/archi-ng" onChange={handleInputChange}
                  {...register("Behance", {
                    required: false,
                    pattern: {
                      value: /(https?|ftp):\/\/[^\s/$.?#].[^\s]*/i,
                      message: 'Field can only contain urls with "https://..."',
                    }
                  })}
                />
              </div>

              <div className={styles.inputdiv}>
                <label htmlFor="Mail">Mail <FontAwesomeIcon icon={faEnvelope} /> </label>
                <input id="Mail" type="email" name="Mail"
                  placeholder="archi-ng@gmail.com" onChange={handleInputChange}
                  {...register("Mail", { required: false })}
                />
              </div>
            </section>

          </form>

          <div className={styles.buttongroup}>
            <button className={styles.submitbutton} form='userDetails' type="submit">{save}</button>

          </div>
        </div>
      }
    </>
  )
}

export default EditProfile