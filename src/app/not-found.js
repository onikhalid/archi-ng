'use client'
import './not-found.module.scss'

import Button from "@/components/Button/button"
import { useRouter } from "next/navigation"
import { Poppins, Lora } from 'next/font/google'
const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--text-poppins',
  display: 'swap',
})




export default function Error({ error, reset }) {
  const router = useRouter()


  return (
    <>

    <title>Error 404: Not Found | Archi NG</title>

      <div className={`${poppins.className} infobox`}>
        <h3>Sorry, We couldn&apos;t find what you&apos;re looking for</h3>
        <Button name={'Go Back'} type={'tertiary'} link={()=>router.back()}/>
        {/* <button onClick={() => reset()}>Try again</button> */}
      </div>
    </>

  )
}