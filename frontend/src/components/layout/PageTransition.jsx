import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function PageTransition({ children }) {
    const container = useRef();
    const location = useLocation();

    useGSAP(() => {
        // A cool staggering animation for elements within the page
        gsap.fromTo(
            container.current,
            { opacity: 0, y: 30, filter: 'blur(10px)' },
            {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.8,
                ease: 'power3.out'
            }
        );

        // Animate inner elements that have .gsap-reveal class
        if (container.current.querySelectorAll('.gsap-reveal').length > 0) {
            gsap.fromTo(
                '.gsap-reveal',
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'power2.out',
                    delay: 0.2
                }
            );
        }
    }, { dependencies: [location.pathname], scope: container });

    return <div ref={container} className="w-full min-h-full">{children}</div>;
}
