
import { db } from '@/utils/firebase';
import {
  collection, addDoc, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove,
  getDoc, setDoc, query, where, getDocs,
} from 'firebase/firestore';
import { toast } from 'react-toastify';



//  add a bookmark
export const addBookmark = async (userId, postId, postTitle, postType, postAuthorId, postCoverPhoto, postAuthorName, postAuthorPhoto) => {
  const bookmarkId = `${userId}_${postId}`
  const bookmarkRef = doc(collection(db, 'bookmarks'), bookmarkId);
  const bookmarkDoc = await getDoc(bookmarkRef);

  if (bookmarkDoc.exists()) {
    // Bookmark already exists
    toast.info('You have already saved this post 😁', {
      autoClose: 4500,
      position: 'top-center',
    })
  } else {
    // Create a new bookmark document
    await setDoc(bookmarkRef, {
      postAuthorId,
      postAuthorPhoto,
      postAuthorName,
      postId,
      postTitle,
      postType,
      postCoverPhoto,
      bookmarkId,
      userId: userId,
    })
  }
  return bookmarkId
};





//delete bookmark
export const deleteBookmark = async (bookmarkId) => {
  const foldersCollectionRef = collection(db, 'folders');
  const bookmarkRef = doc(db, `bookmarks/${bookmarkId}`);
  await deleteDoc(bookmarkRef)

  const q = query(foldersCollectionRef, where('bookmarks', 'array-contains', bookmarkId))
  const foldersSnap = await getDocs(q);
  const foldersThatContainBookmark = [];
  foldersSnap.forEach((doc) => foldersThatContainBookmark.push(doc.data()));
  foldersThatContainBookmark.forEach(async (folder) => {
    const folderDocRef = doc(db, `folders/${folder.folderId}`)
    await updateDoc(folderDocRef, { bookmarks: arrayRemove(bookmarkId) })
  })
}







//  create a folder
export const createFolder = async (folderName, userId, userDisplayName) => {
  const foldersCollectionRef = collection(db, 'folders');

  const newFolderRef = await addDoc(foldersCollectionRef, { folderName, userId });
  const folderId = newFolderRef.id
  await updateDoc(doc(foldersCollectionRef, newFolderRef.id), {
    folderId: folderId,
    bookmarks: [],
    folderOwnerName: userDisplayName
  });
};





//  add a bookmark to a folder 
export const addBookmarkToFolder = async (userId, bookmarkId, folderId, bookmarkPostOwnerId, preventError) => {
  const folderDocRef = doc(db, 'folders', folderId);

  if ((userId == bookmarkPostOwnerId) || preventError) {
    await updateDoc(folderDocRef, { bookmarks: arrayUnion(bookmarkId) });
    return
  } else {
    const parts = bookmarkId.split("_");
    const postId = (parts[1])
    await updateDoc(folderDocRef, { bookmarks: arrayUnion(newBookmark) });
    const newBookmark = await addBookmark(postId, userId)
  }
};






//  remove a bookmark from a folder
export const removeBookmarkFromFolder = async (bookmarkId, folderId) => {
  const folderDocRef = doc(db, 'folders', folderId);
  await updateDoc(folderDocRef, { bookmarks: arrayRemove(bookmarkId) });

};




//  delete a folder
export const deleteFolder = async (folderId) => {
  const folderDocRef = doc(db, 'folders', folderId);
  await deleteDoc(folderDocRef);
};





// pin a post
export const pinPost = async (userId, postId) => {
  const userDocRef = doc(db, `users/${userId}`);
  const userDoc = await getDoc(userDocRef);
  const userData = userDoc.data();

  if (!userData.pinnedPosts || userData.pinnedPosts.length < 2) {
    await updateDoc(userDocRef, { pinnedPosts: arrayUnion(postId) });
  } else {
    const updatedPinnedPosts = userData.pinnedPosts.slice(1);
    updatedPinnedPosts.unshift(postId);
    await updateDoc(userDocRef, { pinnedPosts: updatedPinnedPosts });
    toast.info("One of your pinned post has been replaced",{
      position: "top-center",
      autoClose: 3500
    })
  }
};




// unpin a post
export const unpinPost = async (userId, postId) => {
  const userDocRef = doc(db, `users/${userId}`);
  const userDoc = await getDoc(userDocRef);
  const userData = userDoc.data();

  if (userData.pinnedPosts && userData.pinnedPosts.includes(postId)) {
    await updateDoc(userDocRef, { pinnedPosts: arrayRemove(postId) });
  } else {
    console.log('Post not found in pinnedPosts.');
  }
};