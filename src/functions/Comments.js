import { getFirestore, collection, addDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/utils/firebase';



// Function to add a comment to a post
const addComment = async (postId, commentData) => {
  const commentsCollectionRef = collection(db, 'comments');

  // Create a new comment document
  await addDoc(commentsCollectionRef, commentData);

  // Update the post document to track the number of comments
  const postRef = doc(db, 'Posts', postId);
  await updateDoc(postRef, { commentsCount: db.FieldValue.increment(1), comments:[...postId] });

  // Other logic for adding the comment
};

