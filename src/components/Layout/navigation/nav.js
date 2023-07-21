
"use client"
import styles from './nav.module.scss'
import { useWindowWidth } from '@/utils/Hooks/ResponsiveHook';

import DesktopNav from './navDesktop';
import TabletNav from './navTablet';
import MobileNav from './navMobile';

const Navigation = () => {
  // get window width
  const width = useWindowWidth()


  let renderedNav

  if(width  > 720 && width < 1019){
    renderedNav = <TabletNav/>
  }else if(width  > 1019){
    renderedNav = <DesktopNav/>
  }else{
    renderedNav = <MobileNav />
  }

  return (
    <>
      {renderedNav}
    </>
  )
}

export default Navigation