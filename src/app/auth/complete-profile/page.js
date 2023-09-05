"use client"
import styles from "./complete-profile.module.scss"
import { useRouter } from "next/navigation";
import { useState, useEffect, useLayoutEffect } from "react";
import { useForm } from "react-hook-form";
import { db, auth, storage } from '@/utils/firebase';
import { updateProfile } from "firebase/auth";
import { useAuthState } from 'react-firebase-hooks/auth';
import { getMetadata, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, collection, updateDoc, getDoc, setDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { toast } from "react-toastify";
import EditProfile from "@/components/Profile/EditProfile";


const Page = () => {
  const [user, loading] = useAuthState(auth)













  return (
    <>
      <title>Complete Profile | Archi NG</title>
      {
        loading && <div>Loading..</div>
      }
      {
        user &&
        <div className={styles.container}>
          <h1>Complete your profile</h1>

          <EditProfile save={"Save and Continue ▶"} />

        </div>
      }
    </>
  )
}

export default Page