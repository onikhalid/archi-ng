"use client"
import styles from './button.module.scss'
import Link from "next/link"
import { lora } from '@/app/layout'

const Button = ({ title, name, icon, type, link }) => {
  const typ = type
  return (
    <>
      {
        typ === 'primary' &&
        <Link title={title || ''} className={`${lora.className} ${styles.primary}`} href={link}>
          {name}
        </Link>
      }
      {
        typ === 'secondary' &&
        <button title={title || ''} onClick={link} className={`${lora.className} ${styles.secondary}`}>
          {name}
        </button>
      }
      {
        typ === 'tertiary' &&
        <button title={title || ''} onClick={link} className={styles.tertiary}>
          {name} {icon}
        </button>
      }
      {
        typ === 'type4' &&
        <Link title={title || ''} className={styles.type4} href={link}>
          {name} {icon}
        </Link>
      }
      {
        typ === 'quinta' &&
        <Link title={title || ''} className={styles.quinta} href={link}>
          {name}
        </Link>
      }
      {
        typ === 'sexta' &&
        <button title={title || ''} onClick={link} className={`${styles.sexta}`}>
          {name} {icon}
        </button>
      }
      {
        typ === 'septima' &&
        <button title={title || ''} onClick={link} className={styles.septima}>
          {name} {icon}
        </button>
      }
    </>


  )
}

export default Button