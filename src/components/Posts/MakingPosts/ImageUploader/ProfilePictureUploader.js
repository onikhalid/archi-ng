import styles from './ProfilePictureUploader.module.scss'

import { useState, useEffect } from 'react';
import { getDownloadURL, ref, uploadBytes, deleteObject, getMetadata } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UseFieldArrayUpdate } from 'react-hook-form';
import { auth, db, storage } from '@/utils/firebase';


export default function ProfilePictureUploader({ user, checkFileExists }) {
    const [profilePicture, setProfilePicture] = useState('');

    useEffect(() => {
        const fetchProfilePicture = async () => {
            if (!user) return;

            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const profilePictureURL = getProfilePictureURL(userData);
                    setProfilePicture(profilePictureURL);
                } else {
                    // Handle the case when the user document doesn't exist
                    setProfilePicture(user.photoURL)
                    console.log('no')
                }
            } catch (error) {
                // Handle any errors that occur while retrieving the user document
            }
        };


        fetchProfilePicture();
    }, [user]);



    const getProfilePictureURL = (userData) => {
        if (userData.profilePicture) {
            return userData.profilePicture;
        } else {
            return userData.providerData[0].photoURL;
        }
    };









    const handleProfilePictureChange = async (event) => {
        const file = event.target.files[0];
        const userId = user.uid;

        try {
            const fileName = `pic__${user.displayName}_${userId}.jpg`;
            const picRef = ref(storage, `profile_pictures/${fileName}`);

            const fileExists = await checkFileExists(picRef);

            if (fileExists) {
                await deleteObject(picRef);
                await uploadBytes(picRef, file)
                return;
            }


            await uploadBytes(picRef, file)
            const downloadURL = await getDownloadURL(picRef);
            setProfilePicture(downloadURL);

        } catch (error) {

        }
    };




    return (
        <div>
            <input type="file" accept="image/*" onChange={handleProfilePictureChange} />
            {profilePicture && <img className={styles.picture} src={profilePicture} alt="Profile Picture" />}
        </div>
    );
}
