import { db } from '@/utils/firebase';
import { collection, addDoc, doc, updateDoc, getDoc, setDoc, deleteDoc, increment, decrement, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';


// Function to add a follow relationship between users
export const addFollow = async (followerId, followingId) => {
  const followingDocRef = doc(db, 'follows', `${followerId}_follows_${followingId}`)
  const docSnap = await getDoc(followingDocRef)
  const followerRef = doc(db, 'users', followerId);
  const followingRef = doc(db, 'users', followingId);

  if (!docSnap.exists()) {
    // Update the follower's document to track the number of following
    await updateDoc(followerRef, { followingCount: increment(1) });

    // Update the followee's😁 document to track the number of followers
    await updateDoc(followingRef, { followersCount: increment(1) });
  }

  // Create a new follow document
  await setDoc(followingDocRef, { followerId, followingId });
};


 

// Function to remove a follow relationship between users
export const removeFollow = async (followerId, followingId) => {
  const followingDocRef = doc(db, 'follows', `${followerId}_follows_${followingId}`)
  const docSnap = await getDoc(followingDocRef)
  const followerRef = doc(db, 'users', followerId);
  const followingRef = doc(db, 'users', followingId);

  if (docSnap.exists()) {
    // Find and delete the follow document
    await deleteDoc(followingDocRef);

    // Update the follower's document to track the number of following
    await updateDoc(followerRef, { followingCount: increment(-1) });
    
    // Update the followee's😁 document to track the number of followers
    await updateDoc(followingRef, { followersCount: increment(-1) });
  }
  
};