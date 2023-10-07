import './globals.scss'
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/styles.css";

import { ThemeProvider, UserProvider, MobileNavProvider, ThreadProvider } from '@/utils/ContextandProviders/Providers'

import Body from '@/components/Layout/html/body';


import { Poppins, Lora } from 'next/font/google'
const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--text-poppins',
  display: 'swap',
})
export const lora = Lora({
  subsets: ['latin'],
  variable: '--text-lora',
  display: 'swap',
})





export default function RootLayout({ children }) {



  return (
    <UserProvider>
      <ThemeProvider>
        <MobileNavProvider>
          <ThreadProvider>
            <html className={poppins.className} lang="en">
              <head>
                <link rel='shortcut icon' href='/favicon.ico' />
                <link
                  rel="stylesheet"
                  href="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css"
                />
                <title> Archi NG</title>
              </head>
              <Body>
                {children}
              </Body>
            </html>
          </ThreadProvider>
        </MobileNavProvider>
      </ThemeProvider>
    </UserProvider>

  )
}




