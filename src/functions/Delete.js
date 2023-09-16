import { db, storage } from '@/utils/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { toast } from 'react-toastify';






//1 extract 4rm content
export const extractImages = async (content) => {
    const imageRegex = /<img[^>]+src="([^"]+)"/g;
    const matches = Array.from(content.matchAll(imageRegex), match => match[0]);
    return matches;
};

//2 extrat url
export const extractImageUrl = async (image) => {
    const srcRegex = /src="([^"]+)"/g;
    const matches = [];
    let match;
    while ((match = srcRegex.exec(image))) {
        matches.push(match[1]);
    }
    return matches;
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
        try {
            await deleteObject(coverImageRef)
            
        } catch (error) {
            if (error.code == "storage/object-not-found") {
                toast.info("You might have used the cover image of the just deleted post in another post, we advise against that in the future thank you!", {
                    position: "top-center",
                    autoClose: 4000
                })
            } 
        }


        // Delete all post images
        const extractedImages = await extractImages(content);
        if (extractedImages.length > 0) {
            for (const image of extractedImages) {
                const imageUrl = await extractImageUrl(image);
                if (imageUrl && imageUrl.includes("firebasestorage.googleapis.com/v0/b/archi-nigeria.appspot.com/")) {
                    await deleteImageFromFirebase(imageUrl);
                }
                if (imageUrl && imageUrl.includes("firebasestorage.googleapis.com/v0/b/architecture-ng.appspot.com/")) {
                    await deleteImageFromFirebase(imageUrl);
                }
            }
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








