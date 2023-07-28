"use client"
import { useRouter } from "next/navigation";
import { useLayoutEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "@/utils/firebase";
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";

export default function Profile() {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()
  const userParams = useSearchParams()
  const profileUserId = userParams.get('id')

  useLayoutEffect(() => {

    const getUserUserName = async () => {
      if (!loading && user && !profileUserId) {
        const currentUserId = user.uid
        const userDocRef = doc(db, `users/${currentUserId}`)
        const userDocSnap = await getDoc(userDocRef)
        if (userDocSnap) {
          const userData = userDocSnap.data()
          router.replace(`/profile/${userData.username}`)
        }
      }

      else if (profileUserId) {
        console.log(profileUserId)
        const profileUserRef = doc(db, `users/${profileUserId}`)
        const profileUserSnap = await getDoc(profileUserRef)
        if (profileUserSnap.data()) {
          const userData = profileUserSnap.data()
          router.replace(`/profile/${userData.username}`)
        }
        else {
          toast.error("User doesn't exist", {
            position: 'top-center',
            autoClose: 3500
          })
          router.push(`/`)
        }
      }
    }

    getUserUserName()
    return () => { };
  }, [user])


  return (
    <main className="content-container">
      {
        !loading && !user && router.push('/auth')
      }
    </main>
  );
}
