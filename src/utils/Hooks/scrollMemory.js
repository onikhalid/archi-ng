import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useScrollMemory() {
  const pathname  = usePathname();



  useEffect(() => {
    const scrollY = sessionStorage.getItem('scrollY');
    window.scrollTo(0, parseInt(scrollY) || 0);

    const handleRouteChange = () => {
      sessionStorage.setItem('scrollY', window.scrollY);
    };

    window.addEventListener('scroll', handleRouteChange);

    return () => {
      window.removeEventListener('scroll', handleRouteChange);
    };
  }, [pathname]);
}
