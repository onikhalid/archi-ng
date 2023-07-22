
import { db } from '@/utils/firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { toast } from 'react-toastify';



// Function to add a bookmark
export const addBookmark = async (postId, userId) => {
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
      userId: userId,
      postId: postId,
    })
  }
  return bookmarkId
};


export const deleteBookmark = async (bookmarkId) => {
  const foldersCollectionRef = collection(db, 'folders');
  const bookmarkRef = doc(db, `bookmarks/${bookmarkId}`);
  await deleteDoc(bookmarkRef)

  const q = query(foldersCollectionRef, where('bookmarks', 'array-contains', bookmarkId))
  const foldersSnap = await getDocs(q);
  const foldersThatContainBookmark = [];
  foldersSnap.forEach((doc) => foldersThatContainBookmark.push(doc.data()));
  foldersThatContainBookmark.forEach(async(folder) => {
    const folderDocRef = doc(db, `folders/${folder.folderId}`)
    await updateDoc(folderDocRef, { bookmarks: arrayRemove(bookmarkId) })
  })
}







// Function to create a folder
export const createFolder = async (folderName, userId) => {
  const foldersCollectionRef = collection(db, 'folders');

  // Create a new folder document
  const newFolderRef = await addDoc(foldersCollectionRef, { folderName, userId });
  const folderId = newFolderRef.id
  await updateDoc(doc(foldersCollectionRef, newFolderRef.id), {
    folderId: folderId,
    bookmarks: []
  });
};





// Function to add a bookmark to a folder FROM BOOKMARK MENU
export const addBookmarkToFolder = async (userId, bookmarkId, folderId, bookmarkOwnerId) => {
  const folderDocRef = doc(db, 'folders', folderId);

  if (userId == bookmarkOwnerId) {
    await updateDoc(folderDocRef, { bookmarks: arrayUnion(bookmarkId) });
    return
  } else {
    const parts = bookmarkId.split("_");
    const postId = (parts[1])
    const newBookmark = await addBookmark(postId, userId)
    await updateDoc(folderDocRef, { bookmarks: arrayUnion(newBookmark) });
  }

};






// Function to remove a bookmark from a folder
export const removeBookmarkFromFolder = async (bookmarkId, folderId) => {
  const folderDocRef = doc(db, 'folders', folderId);

  // Update the folder document to remove the bookmark ID from the bookmarks array
  await updateDoc(folderDocRef, { bookmarks: arrayRemove(bookmarkId) });

};




// Function to delete a folder
export const deleteFolder = async (folderId) => {
  const folderDocRef = doc(db, 'folders', folderId);

  // Delete the folder document
  await deleteDoc(folderDocRef);

  // Other logic for deleting the folder
};


