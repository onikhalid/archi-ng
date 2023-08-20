"use client"

import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useState } from "react";

export default function Page({ params }) {

    const[postData, setPostData] = useState({})

    const { postId } = params
    const ol = async () => {
        const postsCollectionRef = doc(db, `posts/${postId}`);
        const postDocs = await getDoc(postsCollectionRef);
        setPostData(postDocs.data())
    }
    const content = postData.postContent
    return (
        <div className='content-container'>
            My Post: {params.postId}
            <h1>{postData.postTitle}</h1>
            <div dangerouslySetInnerHTML={{__html: content}}/>
        </div>
    )
}


export const dynamicParams = false;





export async function generateStaticParams() {
    const postsCollectionRef = collection(db, 'posts');
    const postDocs = await getDocs(postsCollectionRef);

    return postDocs.docs.map((doc) => ({
        postId:  doc.data().postId,
    }));
}



