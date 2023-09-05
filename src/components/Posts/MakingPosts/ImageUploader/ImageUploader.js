import styles from './ImageUploader.module.scss'


import { useEffect, useState } from 'react';
import { auth, storage } from '@/utils/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';

const ImageUploader = ({ ready, setOtherImgURL }) => {
    const [images, setImages] = useState([]);
    const [imageURLs, setImageURLs] = useState([]);
    
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [user, loading] = useAuthState(auth);

    const handleFileChange = (e) => {
        const selectedImages = Array.from(e.target.files);
        setImages([...images, ...selectedImages]);

        // Preview selected images
        const imageUrls = selectedImages.map((image) => URL.createObjectURL(image));
        setImageURLs([...imageURLs, ...imageUrls]);
    };

    const handleRemoveImage = (index) => {
        const updatedImages = [...images];
        const updatedImageURLs = [...imageURLs];

        updatedImages.splice(index, 1);
        updatedImageURLs.splice(index, 1);

        setImages(updatedImages);
        setImageURLs(updatedImageURLs);
    };


    useEffect(() => {

        const handleUpload = async () => {

            if (images.length === 0) {
                return;
            }

            setUploading(true);

            const storageRef = ref(storage, 'images');

            try {
                const downloadURLs = await Promise.all(
                    images.map(async (image) => {
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
                            return null; // or throw an error if needed
                        }
                    })
                );

                setUploading(false);
                setProgress(0);

                setOtherImgURL(downloadURLs)
                console.log('Download URLs:', downloadURLs);
            }

            catch (error) {
                toast.error('Error uploading images', {
                    position: "top-center",
                    autoClose: 3000
                })
                console.error('Error uploading images:', error);
                setUploading(false);
                setProgress(0);
            }
        };


        if (ready) {
            handleUpload()
        }
        return () => {

        };
    }, [ready]);





    return (
        <div>
            <h3>Other Images</h3>
            <input type="file" multiple onChange={handleFileChange} />
            <h6>You can select multiple images at once, or select one by one. Once again, make sure your images are high resolution images.</h6>
            <div className={styles.imagepreviewcontainer}>
                {imageURLs.map((url, index) => (
                    <div key={index} className={styles.imagepreview}>
                        <img src={url} alt={`Image ${index}`} />
                        <span className={styles.closebutton} onClick={() => handleRemoveImage(index)} title='Remove Image'>
                            <FontAwesomeIcon icon={faX} />
                        </span>
                    </div>
                ))}
            </div>
            {uploading && <p>Uploading... {progress.toFixed(2)}%</p>}

        </div>
    );
};

export default ImageUploader;
