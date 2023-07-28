import { db, storage } from '@/utils/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { toast } from 'react-toastify';






//1 extract 4rm content
const extractImages = async (content) => {
    const imageRegex = /<img[^>]+src="([^"]+)"/g;
    const matches = Array.from(content.matchAll(imageRegex), match => match[0]);
    return matches;
};
//2 extrat url
const extractImageUrl = async (image) => {
    console.log(image)
    const srcRegex = /src="([^"]+)"/;
    const match = image.match(srcRegex);
    return match ? match[1] : null;
};

const deleteImageFromFirebase = async (imageUrl) => {
    const startIndex = imageUrl.indexOf('/o/') + 3; // Add 3 to exclude '/o/'
    const endIndex = imageUrl.indexOf('?alt=media');
    const encodedPath = imageUrl.substring(startIndex, endIndex);
    const storagePath = decodeURIComponent(encodedPath);
    const imageRef = ref(storage, storagePath)
    deleteObject(imageRef)
};






export const deletePost = async (postId, content, coverImage) => {

    try {
        //delete cover image from firebase
        const startIndex = coverImage.indexOf('/o/') + 3;
        const endIndex = coverImage.indexOf('?alt=media');
        const encodedPath = coverImage.substring(startIndex, endIndex);
        const storagePath = decodeURIComponent(encodedPath);
        const coverImageRef = ref(storage, storagePath)
        await deleteObject(coverImageRef)


        //delete all posts images
        const extractedImages = await extractImages(content)
        if (extractedImages.length > 0) {
            const ImageURLs = await extractImageUrl(extractedImages)
            await deleteImageFromFirebase(ImageURLs)
        }

        const postRef = doc(db, `posts/${postId}`)
        deleteDoc(postRef)
        toast.info("Post Deleted", {
            position: "top-center",
            autoClose: 2500
        })
    } catch (error) {
        if (error.code == "storage/object-not-found") {
            toast.error("The post you are trying to delete no longer exist", {
                position: "top-center",
                autoClose: 2500
            })
        } else console.log(error)
    }

}








