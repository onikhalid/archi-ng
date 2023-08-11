import {  doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/utils/firebase';

// Function to add a like to a post
export const addLike = async (postId, userId) => {
  const postDocRef = doc(db, `posts/${postId}`)
  await updateDoc(postDocRef, { likes: arrayUnion(userId) });
};

// Function to remove a like from a post
export const removeLike = async (postId, userId) => {
  const postDocRef = doc(db, `posts/${postId}`)
  await updateDoc(postDocRef, { likes: arrayRemove(userId) });
};