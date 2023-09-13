"use client"
import styles from "./settings.module.scss"
import { useRouter, useSearchParams } from "next/navigation"
import { useContext, useRef } from 'react';
import { useState, useEffect, useLayoutEffect } from "react";
import { ThemeContext } from '@/utils/ContextandProviders/Contexts';

import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth, storage } from '@/utils/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, sendSignInLinkToEmail, updateEmail, updatePassword, updateProfile } from "firebase/auth";
import { doc, collection, getDoc, setDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';

import WhoseandWhichpost from "@/components/Posts/ShowingPosts/Whosepost/whosepost"
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressBook, faCircleQuestion, faCircleUser, faEnvelopeCircleCheck, faFileContract, faLock, faPen, faRightFromBracket, faUserPen, faUsers } from "@fortawesome/free-solid-svg-icons";
import EditProfile from "@/components/Profile/EditProfile";


const Settings = () => {
  const router = useRouter()
  const [currentSettings, setcurrentSettings] = useState("App Settings");
  const { theme, toggleTheme } = useContext(ThemeContext);


  const sections = [
    {
      number: 1,
      name: "App Settings",
    },
    {
      number: 2,
      name: "Edit Profile",
    }
  ];










  //////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////            PROFILE FORM           /////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////

  const { register, handleSubmit, watch, formState: { errors }, setValue, setError } = useForm();
  const [user, loading] = useAuthState(auth)


  /////////////////////////////////////////////////////////////
  ///////////////       PREPOPULATE FORM     //////////////////
  /////////////////////////////////////////////////////////////
  // form fields
  const [username, setuserName] = useState('');



  //Get User Info to prepopulate the form with
  useLayoutEffect(() => {
    const GetUserInfo = async () => {
      try {
        if (!loading) {
          if (!user) {
            toast.error("Sign in to see setttings", {
              position: "top-center",
              autoClose: 2500
            })
            router.push('/auth?redirect=home')
          }
          else {

            const userProfileRef = doc(db, `users/${user?.uid}`)
            const userProfileSnap = await getDoc(userProfileRef)
            const userData = userProfileSnap.data()

            const { username } = userData
            setuserName(username)

          }

        }
      } catch (error) {
        if (error.code == "offline" || "unavailable") {
          toast.error("You appear to be offline, Check your connection and try again", {
            position: "top-center",
            autoClose: 4500
          })
        }
      }


    }
    GetUserInfo()
  }, [user, loading]);






  ///////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////              APP SETTINGS              /////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////

  const [toBeEdited, setToBeEdited] = useState("");



  // ////////////////////////////////////////////////////// //
  // //////////           LOGOUT         ////////////////// //
  // ////////////////////////////////////////////////////// //
  const logOut = () => {
    toast.success("Succesfully signed out", {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3500,
    });
    auth.signOut()
  }

  // /////////////////////////////////////////////////// //
  // //////////    EMAIL VERIICATION     ///////////////// //
  // ///////////////////////////////////////////////////// //
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
        toast.error("You previously signed up with google, . Add a password to your account and try again", {
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

  // //////////////////////////////////////////////////// //
  // //////////    CHANGE EMAIL      ///////////////// //
  // //////////////////////////////////////////////////// //
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
            <EditProfile save={"Save Changes"} />
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

                    <span onClick={() => setcurrentSettings("Edit Profile")} className={styles.settingslink}> <FontAwesomeIcon icon={faUserPen} />
                      Edit Profile
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
                      <div className="rulesdiv">
                        {
                          user.providerData[0].providerId === "google.com" && <>
                          <h6>1. There's no password to change as you previously signed up/in with Google</h6>
                          <h6>2. If you want to use a password with your account, access the authenticated page and do these</h6>
                          <h6>Try signing up llike a new user using your current email, choose your password</h6>
                          <h6>...and viola!</h6>

                            
                            
                          </>
                        }
                      </div>
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
                    <span onClick={() => router.push("/about")} className={styles.settingslink}> <FontAwesomeIcon icon={faUsers} />
                      About Us
                    </span>

                    <span onClick={() => router.push("/terms")} className={styles.settingslink}> <FontAwesomeIcon icon={faFileContract} />
                      Terms and Conditions
                    </span>

                    <span onClick={() => router.push("/policy")} className={styles.settingslink}> <FontAwesomeIcon icon={faLock} />
                      Privacy Policy
                    </span>

                    <span onClick={() => router.push("/faqs")} className={styles.settingslink}> <FontAwesomeIcon icon={faCircleQuestion} />
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