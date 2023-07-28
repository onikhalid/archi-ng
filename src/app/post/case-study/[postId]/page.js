"use client"
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

import { collection, getDocs, getDoc, doc, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";
import Image from "next/image";



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
                    <h1>{postData.title}</h1>
                    <Image 
                        src={postData.coverImageURL}
                        height={350}
                        width={500}
                        layout="responsive"
                    />

                    {/* <div dangerouslySetInnerHTML={{ __html: content }} /> */}
                </div> :

                    <div className='infobox'>
                        <h2>Post doesn&apos; exist or has been deleted</h2>
                    </div>
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




