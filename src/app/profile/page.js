"use client"
import { useRouter } from "next/navigation";
import { useContext, useLayoutEffect } from "react";
import { db } from "@/utils/firebase";
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { UserContext } from "@/utils/ContextandProviders/Contexts";




export default function Profile() {
  const { userData, setUserData, authenticatedUser, loadingauthenticatedUser } = useContext(UserContext);

  const router = useRouter()
  const userParams = useSearchParams()
  const profileUserId = userParams.get('id')

  useLayoutEffect(() => {

    const getUserUserName = async () => {
      if (!loadingauthenticatedUser && authenticatedUser && !profileUserId) {
        const currentUserId = authenticatedUser.uid
        const userDocRef = doc(db, `users/${currentUserId}`)
        const userDocSnap = await getDoc(userDocRef)
        if (userDocSnap) {
          const userData = userDocSnap.data()
          router.replace(`/profile/${userData?.username}`)
        }
      }
      else if (!loadingauthenticatedUser && !authenticatedUser && !profileUserId) {
        router.push(`/auth?redirect=home`)
      }
      else if (profileUserId) {

        const profileUserRef = doc(db, `users/${profileUserId}`)
        const profileUserSnap = await getDoc(profileUserRef)
        if (profileUserSnap.data()) {
          const userData = profileUserSnap.data()
          router.replace(`/profile/${userData?.username}`)
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
  }, [authenticatedUser, loadingauthenticatedUser, profileUserId])










  

  return (
    <>
      <title>Profile | Archi NG</title>
      <main className="content-container">
        <div className="infobox">
          <h3>
            loading  profile...
          </h3>
        </div>
      </main>
    </>
  );
}