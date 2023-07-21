import {  collection, addDoc, doc, updateDoc, onSnapshot, increment } from 'firebase/firestore';
import { db } from '@/utils/firebase';
// Function to add a like to a post
export const addLike = async (postId, userId) => {
  const likesCollectionRef = collection(db, 'likes');

  // Create a new like document
  await addDoc(likesCollectionRef, { postId, userId });

  // Update the post document to track the number of likes
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, { likesCount: increment(1) });
    return
  // Other logic for adding the like
};

// Function to remove a like from a post
// const removeLike = async (postId, userId) => {
//   const firestore = getFirestore();
//   const likesCollectionRef = collection(db, 'likes');

//   // Find and delete the like document
//   const likeQuerySnapshot = await likesCollectionRef.where('postId', '==', postId).where('userId', '==', userId).get();
//   if (!likeQuerySnapshot.empty) {
//     const likeDocRef = doc(firestore, 'likes', likeQuerySnapshot.docs[0].id);
//     await updateDoc(likeDocRef, { deleted: true }); // Optionally mark the like as deleted
//     await likeDocRef.delete();
//   }

//   // Update the post document to reflect the removed like
//   const postRef = doc(db, 'Posts', postId);
//   await updateDoc(postRef, { likesCount: db.FieldValue.increment(-1) });

//   // Other logic for removing the like
// };

// // Function to check if a user has liked a post
// const hasLikedPost = async (postId, userId) => {
//   const firestore = getFirestore();
//   const likesCollectionRef = collection(db, 'likes');

//   // Query likes for the specified post and user
//   const likeQuerySnapshot = await likesCollectionRef.where('postId', '==', postId).where('userId', '==', userId).get();
//   return !likeQuerySnapshot.empty;
// };

// // Usage example
// const postId = '...'; // ID of the post for which you want to add, remove, or check likes
// const userId = '...'; // ID of the user performing the like or check

// // Adding a like
// addLike(postId, userId);

// // Removing a like
// removeLike(postId, userId);

// // Checking if a user has liked a post
// const hasLiked = await hasLikedPost(postId, userId);
// console.log('Has liked:', hasLiked);
