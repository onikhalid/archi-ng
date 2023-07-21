import styles from './ImageUploader.module.scss'

import { useState, useContext, useEffect } from 'react';
import { auth, storage } from '@/utils/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';

import { SubmitContext } from '@/utils/ContextandProviders/Contexts';

export const ImageUploader = ({ name, setURL, ready }) => {
  const { submitted, toggleSubmitted} = useContext(SubmitContext)
    const [selectedImage, setSelectedImage] = useState(null);
    const [user, loading] = useAuthState(auth);


    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        setSelectedImage(file);
    };

    const uploadImage = async (imageFile) => {
        const imageRef = ref(storage, `cover_images/${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile)
        const downloadURL = await getDownloadURL(snapshot.ref);
        ready(true)
        return downloadURL;
    };

    const handleSubmit = async () => {
        if (selectedImage) {
            const downloadURL = await uploadImage(selectedImage);
            setURL(downloadURL)
        }
    };
    useEffect(() => {
         if (submitted) {
        handleSubmit()
    }
    }, [submitted]);
   

    return (
        <form className={styles.imageuploader}>
            <h3>{name}</h3>
            <input type="file" onChange={handleImageUpload} /> <h6>Please make sure your image is in landscape form</h6>
            {selectedImage && <img className={styles.uploadedimage} src={URL.createObjectURL(selectedImage)} alt="Preview" />}
        </form>
    );
};