"use client"
import styles from "./userInfo.module.scss"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { db, auth, storage } from '@/utils/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getMetadata, getDownloadURL, ref } from "firebase/storage";
import { doc, collection, addDoc, updateDoc, getDoc, setDoc, getDocs, serverTimestamp, query, where } from 'firebase/firestore';
import Button from "@/components/Button/button";
import ProfilePictureUploader from "@/components/Posts/MakingPosts/ImageUploader/ProfilePictureUploader";
import { toast } from "react-toastify";

const Page = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [user, loading] = useAuthState(auth)
  const [userInfo, setUserInfo] = useState({})


  // form fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [userName, setuserName] = useState('');
  const [occupation, setOccupation] = useState([]);





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


  const createProfile = async (data) => {

    const fileName = `pic__${user.displayName}_${user.uid}.jpg`;
    const picRef = ref(storage, `profile_pictures/${fileName}`);
    const fileExists = await checkFileExists(picRef);
    const pic = fileExists && await getDownloadURL(picRef)


    const userData = {
      id: user?.uid,
      name: data.Name,
      username: data.Username,
      bio: data.Bio,
      profilePicture: fileExists ? pic : user?.photoURL,
    }

    const userCollectionRef = collection(db, 'users');
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      // route.push("/auth/userInfo");
    }
    else {
      const newUserProfile = await setDoc(userDocRef, { ...userData });
    }

  }
  // check If Username Is Taken
  const checkIfUsernameTaken = async (username) => {
    console.log(username)
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };



  return (
    <div className={styles.userDetails}>
      <h1>Complete your profile</h1>


      <ProfilePictureUploader user={user} checkFileExists={checkFileExists} />
      <form id='userDetails' className={styles.caseinfo} onSubmit={handleSubmit(createProfile)}>
        <div className={styles.inputdiv}>
          <label htmlFor="Name">Full name<span>*</span></label>
          <input id="Name" type="text" placeholder="Adanna Nwoku Elizabeth"  {...register("Name", { required: true })} />
          {errors.Name && <span>Full Name field is required</span>}
        </div>
        <div className={styles.inputdiv}>
          <label htmlFor="Bio">About me<span>*</span></label>
          <textarea name="Bio" rows="3" maxLength="150" placeholder="Write a little about yourself" {...register("Bio", { required: true })}></textarea>
          {errors.Bio && <span>About me field is required</span>}
        </div>

        <div className={styles.inputdiv}>
          <label htmlFor="Username">Username<span>*</span></label>
          <input id="Username" type="text" name="Username"
            placeholder="Choose a unique username"
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
          <select id="occupation" {...register("Occupation")}>
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
        <Button name='Skip ⏭' type='primary' link='/' />
        <button className={styles.submitbutton} form='userDetails' type="submit">Save and Continue ▶</button>

      </div>
    </div>
  )
}

export default Page