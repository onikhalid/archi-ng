"use client"


import { db } from "@/utils/firebase";
import { collection, getDocs, doc, query, where, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";





export default function Page({ params }) {
    const { postId } = params




    const content = postData?.postContent
    const pageTitle = postData && `${postData.title} - Article by ${postData.authorName} | Archi NG`








    return (

        <>
            <title>{pageTitle}</title>

   
        </>
    )
}










export const dynamicParams = false;

export async function generateStaticParams() {
    const postsCollection = collection(db, 'posts');
    const articlesQuery = query(postsCollection, where('postType', '==', 'Photography'));
    const articlesDocs = await getDocs(articlesQuery);

    return articlesDocs.docs.map((doc) => ({
        postId: doc.data().postId,
    }));
}
