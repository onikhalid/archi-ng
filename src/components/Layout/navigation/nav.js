
"use client"
import { useLayoutEffect, useState} from 'react';
import { useWindowWidth } from '@/utils/Hooks/ResponsiveHook';

import DesktopNav from './navDesktop';
import TabletNav from './navTablet';
import MobileNav from './navMobile';





const Navigation = () => {
  const width = useWindowWidth()
  const [nav, setNav] = useState()

  useLayoutEffect(() => {
    const getAppropriateNav = () => {

      if (width > 720 && width < 1020) {
        setNav(<TabletNav />) 

      } else if (width > 1019) {
        setNav(<DesktopNav /> )

      } else {
        setNav(<MobileNav />) 

      }
    }

    getAppropriateNav ()

  }, [width])




  return (
    <>
      {nav}
    </>
  )
}

export default Navigation