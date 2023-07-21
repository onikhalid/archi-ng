import { getFirestore, collection, addDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/utils/firebase';
// Function to add a comment to a post
const addComment = async (postId, commentData) => {
  const commentsCollectionRef = collection(db, 'comments');

  // Create a new comment document
  await addDoc(commentsCollectionRef, commentData);

  // Update the post document to track the number of comments
  const postRef = doc(db, 'Posts', postId);
  await updateDoc(postRef, { commentsCount: db.FieldValue.increment(1) });

  // Other logic for adding the comment
};

// Function to retrieve comments for a post
const getComments = (postId) => {
  const firestore = getFirestore();
  const commentsCollectionRef = collection(db, 'comments');

  // Query comments for the specified post
  const postCommentsQuery = commentsCollectionRef.where('postId', '==', postId);

  onSnapshot(postCommentsQuery, (querySnapshot) => {
    const comments = querySnapshot.docs.map((doc) => doc.data());
    // Use the comments in your component
    console.log('Comments:', comments);
  });
};

// Usage example
const postId = '...'; // ID of the post for which you want to add or retrieve comments

// Adding a comment
const commentData = {
  postId: postId,
  userId: '...',
  content: 'This is a comment.',
  // Other comment data
};
addComment(postId, commentData);

// Retrieving comments
getComments(postId);
