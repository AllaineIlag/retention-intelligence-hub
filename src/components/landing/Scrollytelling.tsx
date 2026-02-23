'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

/**
 * StickySection provides a container where the content on the left stays fixed
 * while multiple items on the right scroll past it.
 */
export function StickySection({
    children,
    leftContent
}: {
    children: React.ReactNode;
    leftContent: React.ReactNode;
}) {
    return (
        <div className="relative flex flex-col lg:flex-row gap-12 lg:gap-20 py-24 sm:py-32">
            {/* Fixed Left Component */}
            <div className="lg:sticky lg:top-32 h-fit lg:w-[40%] lg:pr-12">
                {leftContent}
            </div>

            {/* Scrolling Right Content */}
            <div className="lg:w-[60%] space-y-24 lg:space-y-32 pb-[20vh]">
                {children}
            </div>
        </div>
    );
}

/**
 * ScrollProgressFade provides a simple fade/scale effect tied to scroll visibility.
 */
export function ScrollProgressFade({ children }: { children: React.ReactNode }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["0 1", "1.2 1"]
    });

    const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
    const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);

    return (
        <motion.div
            ref={ref}
            style={{
                opacity,
                scale,
                transition: "all 0.5s cubic-bezier(0.17, 0.55, 0.55, 1)"
            }}
        >
            {children}
        </motion.div>
    );
}

/**
 * Simple InView reveal for staggered elements.
 */
export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.3 });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{
                duration: 0.8,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98]
            }}
        >
            {children}
        </motion.div>
    );
}
