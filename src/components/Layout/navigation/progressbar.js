"use client"
import nprogress from 'nprogress';
import { useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'

export const ProgressBar = () => {
    const pathname = usePathname()

    useLayoutEffect(() => {
        nprogress.start()
       
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