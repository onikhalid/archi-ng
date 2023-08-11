import { db } from '@/utils/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { toast } from 'react-toastify';




// Function to remove a follow relationship between users
export const removeFollow = async (followerId, followingId) => {
  const followerDocRef = doc(db, `users/${followerId}`);
  const followingDocRef = doc(db, `users/${followingId}`);

  await updateDoc(followingDocRef, { followers: arrayRemove(followerId) });
  await updateDoc(followerDocRef, { following: arrayRemove(followingId) });

};




// Function to add a follow relationship between users
export const addFollow = async (followerId, followingId) => {
  const followerDocRef = doc(db, `users/${followerId}`);
  const followingDocRef = doc(db, `users/${followingId}`);

  await updateDoc(followingDocRef, { followers: arrayUnion(followerId) });
  await updateDoc(followerDocRef, { following: arrayUnion(followingId) });

};
