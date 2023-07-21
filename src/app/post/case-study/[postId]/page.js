"use client"
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

import { collection, getDocs, getDoc, doc, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";



export default function Page({ params }) {
    const router = useRouter()
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


    const content = postData?.postContent
    return (

        <>
            {
                postData ? <div className='content-container'>
                    My Post: {params.postId}
                    <h1>{postData.postTitle}</h1>
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div> :

                    router.push('/404')
            }
        </>

    )
}







export const dynamicParams = false;
export async function generateStaticParams() {
    const postsCollection = collection(db, 'posts');
    const articlesQuery = query(postsCollection, where('postType', '==', 'Case Studies'));
    const articlesDocs = await getDocs(articlesQuery);

    return articlesDocs.docs.map((doc) => ({
        postId: doc.data().postId,
    }));
}




