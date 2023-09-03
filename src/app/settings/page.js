"use client"
import styles from "./settings.module.scss"
import { useRouter, useSearchParams } from "next/navigation"
import { useContext, useRef } from 'react';
import { useState, useEffect, useLayoutEffect } from "react";
import { ThemeContext } from '@/utils/ContextandProviders/Contexts';

import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth, storage } from '@/utils/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, sendSignInLinkToEmail, updateEmail, updatePassword, updateProfile } from "firebase/auth";
import { getMetadata, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, collection, getDoc, setDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';

import WhoseandWhichpost from "@/components/Posts/ShowingPosts/Whosepost/whosepost"
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressBook, faCircleQuestion, faCircleUser, faEnvelopeCircleCheck, faFileContract, faLock, faPen, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";



const Settings = () => {
  const router = useRouter()
  const [currentSettings, setcurrentSettings] = useState("Edit Profile");
  const { theme, toggleTheme } = useContext(ThemeContext);


  const sections = [
    {
      number: 1,
      name: "Edit Profile",
    },
    {
      number: 2,
      name: "App Settings",
    }
  ];










  //////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////            PROFILE FORM           /////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////

  const { register, handleSubmit, watch, formState: { errors }, setValue, setError } = useForm();
  const [user, loading] = useAuthState(auth)
  const [savingProfile, setSavingProfile] = useState(false)
  const [pictureURL, setPictureURL] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const newUserPic = "/assets/logo/logo-light.svg"

  /////////////////////////////////////////////////////////////
  ///////////////       PREPOPULATE FORM     //////////////////
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
        if (!user) {
          toast.error("Sign in to see setttings", {
            position: "top-center",
            autoClose: 2500
          })
          router.push('/auth?redirect=settings')
        }
        else {

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


    }
    GetUserInfo()
  }, [user, loading]);




  /////////////////////////////////////////////////////////////////////////////////////
  //////////////////      PROFILE UPDATE FORM SUBMISSION        ///////////////////////
  /////////////////////////////////////////////////////////////////////////////////////

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
  //////////////////////////////////////////////////////////////////////
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
    //////////////////////////////////////////////////////////////////////////////////
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

  }



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
    console.log(downloadURL)

    return downloadURL;
  };


















  ///////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////              APP SETTINGS              /////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////

  const [toBeEdited, setToBeEdited] = useState("");



  const logOut = () => {
    toast.success("Succesfully signed out", {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3500,
    });
    auth.signOut()
  }



  const sendEmailVerification = async () => {
    if (user) {
      try {
        const userEmail = user?.email
        const actionCodeSettings = {
          url: 'https://archi-ng.vercel.app',
          handleCodeInApp: false
        };

        await sendSignInLinkToEmail(auth, userEmail, actionCodeSettings);
        toast.success("Verification email sent", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 6000,
        });
      }
      catch (error) {
        toast.error("Error sending verification email, you're probably using an invalid email. Change your email and try again", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2500,
        });
      }
    }
    else {
      toast.error("You are not signed in", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 2500,
      });
    }

  }



  // //////////////////////////////////////////////////// //
  // //////////    CHANGE PASSWORD      ///////////////// //
  // //////////////////////////////////////////////////// //
  const changePassword = async (data) => {
    const { currentPassword, newPassword, newPassword2 } = data

    if (newPassword == newPassword2) {
      if (user.providerData[0].providerId === "google.com") {
        toast.error("You previously signed up with google, . Change your email and try again", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 4500,
        });
      }
      else if (user.providerData[0].providerId === "password") {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        try {
          await reauthenticateWithCredential(user, credential);
          await updatePassword(user, newPassword);
          toast.success("Password updated successfully", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 4500,
          });
        }
        catch (error) {
          if (error.code == "auth/wrong-password") {
            setError('currentPassword', {
              type: 'validate',
              message: 'Invalid Password, Check and try again.',
            });
          } else {
            toast.error("Error updating password", {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 4500,
            });
          }

        }

      }
    }
    else {
      setError('newPassword2', {
        type: 'validate',
        message: 'Passwords do not match',
      });
    }

  }

  const changeEmail = async (data) => {
    const { newEmail, Password } = data
    try {
      const credential = EmailAuthProvider.credential(user.email, Password);
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, newEmail);
      toast.success("Email updated successfully", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 4500,
      });
    }
    catch (error) {
      if (error.code == "auth/wrong-password") {
        setError('Password', {
          type: 'validate',
          message: 'Invalid Password, Check and try again.',
        });
      }
      else if (error.code == "auth/too-many-requests") {
        toast.error("Too many attempts, account temporarily restricted", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 7500,
        });
      }
      else {
        toast.error("Error updating password", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 4500,
        });
        console.log(error)
      }
    }

  }


  const wrapperRef = useRef()
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setToBeEdited("");
      }
    };
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [toBeEdited]);




  const pageTitle = `Settings |  Archi NG`












  return (
    <>
      <title>{`${pageTitle} - ${currentSettings}`}</title>
      <main className="content-container">

        {/* ///////////////////////////////////////////////////////////// */}
        {/* //////////////       HEADER      //////////////////////// */}
        {/* ///////////////////////////////////////////////////////////// */}


        <header className={styles.header}>
          <h1>Settings</h1>
          <WhoseandWhichpost variations={sections} currentwhosePost={currentSettings} setCurrentWhosePost={setcurrentSettings} />

        </header>


        <section className={styles.pagecontainer}>
          {
            loading && <div>Loading..</div>
          }



          {/* ////////////////////////////////////////////////////////////////////////// */}
          {/* ///////////////////        EDIT PROFILE     ////////////////////////////// */}
          {/* ////////////////////////////////////////////////////////////////////////// */}

          {
            user && currentSettings == "Edit Profile" &&
            <section className={styles.userDetails}>
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
                  <textarea name="Bio" rows="5" maxLength="250" onChange={handleInputChange}
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
                <button className={styles.submitbutton} form='userDetails' type="submit">Save</button>

              </div>
            </section>
          }











          {/* /////////////////////////////////////////////////////////////////////////// */}
          {/* ///////////////////////////    APP SETTINGS      ////////////////////////// */}
          {/* /////////////////////////////////////////////////////////////////////////// */}
          {
            user && currentSettings == "App Settings" &&
            <section className={styles.appSettings}>
              <ul>


                <li>
                  <h5>Appearance</h5>

                  <div>
                    <article className={styles.themeswitch}>
                      Theme
                      <div className={styles.switchsvg}>
                        <input onClick={toggleTheme} type="checkbox" id="switch" />
                        <label htmlFor="switch">th</label>
                      </div>
                    </article>
                  </div>

                </li>



                {/* ACCOUNT SETTINGS */}
                <li ref={wrapperRef}>
                  <h5>Account</h5>

                  <div className={styles.accountsettings} >

                    <span onClick={() => router.push(`/profile/${username}`)} className={styles.settingslink}> <FontAwesomeIcon icon={faCircleUser} />
                      View Profile
                    </span>

                    {
                      !user.emailVerified &&
                      <span onClick={sendEmailVerification} className={styles.settingslink}> <FontAwesomeIcon icon={faEnvelopeCircleCheck} />
                        Verify Email
                      </span>
                    }

                    <span onClick={() => setToBeEdited("Email")} className={styles.settingslink}> <FontAwesomeIcon icon={faPen} />
                      Change Email
                    </span>

                    <span onClick={() => setToBeEdited("Password")} className={styles.settingslink}> <FontAwesomeIcon icon={faLock} />
                      Change Password
                    </span>

                    <span onClick={logOut} className={styles.settingslink}> <FontAwesomeIcon icon={faRightFromBracket} />
                      Logout
                    </span>



                  </div>
                  {
                    toBeEdited == "Email" &&
                    <form id='changeEmail' className={styles.changeform} onSubmit={handleSubmit(changeEmail)}>
                      
                      <div className={`inputdiv ${styles.inputdiv}`}>
                        <label>Password<span>*</span></label>
                        <input type="password" {...register('Password', {
                          required: 'Password is required'
                        })} />
                        {errors.Password && <span>{errors.Password.message}</span>}
                      </div>

                      <div className={`inputdiv ${styles.inputdiv}`}>
                        <label htmlFor="newEmail">New Email<span>*</span></label>
                        <input
                          id="newEmail" name="Email" type="email"
                          placeholder="arching@app.com"
                          {...register("newEmail", { required: true })} />
                        {errors.newEmail && <span>Email field is required</span>}
                      </div>
                      <button form="changeEmail" type="submit" className={styles.submitbutton}>Change Email</button>
                    </form>
                  }

                  {
                    toBeEdited == "Password" &&
                    <form id='changePassword' className={styles.changeform} onSubmit={handleSubmit(changePassword)}>

                      <div className={`inputdiv ${styles.inputdiv}`}>
                        <label>Current Password<span>*</span></label>
                        <input type="password" {...register('currentPassword', {
                          required: 'Current Password is required'
                        })} />
                        {errors.currentPassword && <span>{errors.currentPassword.message}</span>}
                      </div>


                      <div className={`inputdiv ${styles.inputdiv}`}>
                        <label>New Password<span>*</span></label>
                        <input type="password" {...register('newPassword', {
                          required: 'Password is required',
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters long',
                          },
                          pattern: {
                            value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                            message: 'Passwords can only contain numbers and letters and must contain at least one letter and one number',
                          },
                        })} />
                        {errors.newPassword && <span>{errors.newPassword.message}</span>}
                      </div>


                      <div className={`inputdiv ${styles.inputdiv}`}>
                        <label>Repeat Password<span>*</span></label>
                        <input type="password" {...register('newPassword2')} />
                        {errors.newPassword2 && <span>{errors.newPassword2.message}</span>}
                      </div>



                      <button form="changePassword" type="submit" className={styles.submitbutton}>Change Password</button>
                    </form>
                  }


                </li>



                {/* HELP AND SUPPORT */}
                <li>
                  <h5>Help and Support</h5>

                  <div className={styles.helpsettings}>
                    <span onClick={() => router.push("/terms")} className={styles.settingslink}> <FontAwesomeIcon icon={faFileContract} />
                      Terms and Conditions
                    </span>

                    <span onClick={() => router.push("Email")} className={styles.settingslink}> <FontAwesomeIcon icon={faCircleQuestion} />
                      FAQs
                    </span>

                    <span onClick={() => router.push("/contact")} className={styles.settingslink}> <FontAwesomeIcon icon={faAddressBook} />
                      Contact Us
                    </span>
                  </div>
                </li>




              </ul>

            </section>
          }
        </section>

      </main>
    </>
  )
}

export default Settings 