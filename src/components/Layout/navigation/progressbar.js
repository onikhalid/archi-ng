"use client"
import nprogress from 'nprogress';
import { useLayoutEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export const ProgressBar = () => {
    const router = useRouter();
    const pathname = usePathname()

    useLayoutEffect(() => {
        nprogress.start()
        // You can now use the current URL
        // ...
        //   handleRouteChange()
        setTimeout(() => {
            nprogress.done();
        }, 1000);
        return () => {
            nprogress.done();
        };
    }, [pathname])



    return (
        <div>
            <div id="progress-bar"></div>
        </div>
    );
};