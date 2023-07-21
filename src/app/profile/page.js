"use client"
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/utils/firebase";


export default function Profile() {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()


  return (
    <main className="content-container">
      {
        !loading && !user && router.push('/auth')
      }
    </main>
  );
}
