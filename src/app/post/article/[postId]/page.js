"use client"

import { collection, getDocs, getDoc, doc, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useState, useEffect } from "react";
import Image from "next/image";


export default function Page({ params }) {
    const [postData, setPostData] = useState({})

    const { postId } = params


    useEffect(() => {
        const getPost = async () => {
            const postsCollectionRef = doc(db, `posts/${postId}`);
            const postDocs = await getDoc(postsCollectionRef);
            setPostData(postDocs.data())
        }
        getPost()

    }, [postId])


    return (
        <main className='content-container'>
            My Post: {params.postId}
            <h1>{postData.postTitle}</h1>
            <Image
                src={postData.imageURL}
                alt={`article cover image`}
                width={1000}
                height={500}
                layout="responsive"
            />
            <div dangerouslySetInnerHTML={{ __html: postData.postContent }} />
        </main>

    )
}





export const dynamicParams = false;

export async function generateStaticParams() {
    const postsCollection = collection(db, 'posts');
    const articlesQuery = query(postsCollection, where('postType', '==', 'Articles'));
    const articlesDocs = await getDocs(articlesQuery);

    return articlesDocs.docs.map((doc) => ({
        postId: doc.data().postId,
    }));
}
