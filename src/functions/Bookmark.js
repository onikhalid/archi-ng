
import { db } from '@/utils/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove, getDoc, setDoc, query, where, getDocs, } from 'firebase/firestore';
import { toast } from 'react-toastify';





//  add a bookmark
export const addBookmark = async (userId, postId, postTitle, postType, postAuthorId, postCoverPhoto, postAuthorName, postAuthorPhoto) => {
  try {
    const bookmarkId = `${userId}_${postId}`
    const bookmarkRef = doc(collection(db, 'bookmarks'), bookmarkId);
    const bookmarkDoc = await getDoc(bookmarkRef);
    const postDocRef = doc(db, `posts/${postId}`);


    if (bookmarkDoc.exists()) {
      // Bookmark already exists
      toast.info('You have already saved this post 😁', {
        autoClose: 4500,
        position: 'top-center',
      })
    } else {
      // Create a new bookmark document
      await updateDoc(postDocRef, { bookmarks: arrayUnion(userId) })
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
  }
  catch (error) {
    if (error.code === "failed-precondition") {
      toast.error("Bad internet connection")
    }
  }
};





//delete bookmark
export const deleteBookmark = async (bookmarkId, userId, postId, deleted) => {
  const foldersCollectionRef = collection(db, 'folders');
  const postDocRef = doc(db, `posts/${postId}`);
  const bookmarkRef = bookmarkId ? doc(db, `bookmarks/${bookmarkId}`) : doc(db, `bookmarks/${userId}_${postId}`)
  await deleteDoc(bookmarkRef)
  if (!deleted) {
    await updateDoc(postDocRef, { bookmarks: arrayRemove(userId) })
  }



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
  const bookmarkDocRef = doc(db, 'bookmarks', bookmarkId)
  const bookmarkSnap = await getDoc(bookmarkDocRef)

  if (bookmarkSnap.exists()) {
    if ((userId == bookmarkPostOwnerId) || preventError) {
      await updateDoc(folderDocRef, { bookmarks: arrayUnion(bookmarkId) });
      return
    } else {
      const parts = bookmarkId.split("_");
      const postId = (parts[1])
      const newBookmark = await addBookmark(postId, userId)
      await updateDoc(folderDocRef, { bookmarks: arrayUnion(newBookmark) });
    }

  } else {
    toast.error("Either this bookmark doesn't exist or it has been deleted", { position: "top-center" })
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
    toast.info("One of your pinned post has been replaced", {
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