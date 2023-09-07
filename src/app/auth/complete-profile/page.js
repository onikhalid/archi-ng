"use client"
import styles from "./complete-profile.module.scss"
import { auth } from '@/utils/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
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

          <EditProfile save={"Save and Continue ▶"} update />

        </div>
      }
    </>
  )
}

export default Page