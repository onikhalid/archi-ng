import './globals.scss'
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

import { ThemeProvider } from '@/utils/ContextandProviders/Providers'
import Body from '@/components/Layout/html/body';

export const metadata = {
  title: 'archi NG',
  description: 'Documenting architecture by Nigerians for Nigerians',
}


import { Poppins, Lora } from 'next/font/google'
const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--text-poppins',
  display: 'swap',
})
export const lora = Lora({
  // weight: ['300','400','500','600','700', '800', '900'],
  subsets: ['latin'],
  variable: '--text-lora',
  display: 'swap',
})





export default function RootLayout({ children }) {
  return (
    <ThemeProvider>
      <html className={poppins.className} lang="en">
        <head>
          <link rel='shortcut icon' href='/favicon.ico' />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css"
          />
        </head>
        <Body>
          {children}
        </Body>
      </html>
    </ThemeProvider>

  )
}




