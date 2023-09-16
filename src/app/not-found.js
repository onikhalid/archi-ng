'use client'
import styles from './not-found.module.scss'

import { useRouter } from "next/navigation"
import { Poppins, Lora } from 'next/font/google'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--text-poppins',
  display: 'swap',
})




export default function Error() {
  const router = useRouter()


  return (
    <>

      <title>Error 404: Not Found | Archi NG</title>

      <div className={`${poppins.className} ${styles.errorPage}`}>
        <FontAwesomeIcon icon={faTriangleExclamation}/>
        <h1>Error 404 </h1>
        <h3>Sorry, we couldn&apos;t find what you&apos;re looking for</h3>
        <Link href={'/'} className={styles.capsulebutton}>Go Back Home</Link>
      </div>
    </>

  )
}