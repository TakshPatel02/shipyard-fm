"use client";

import { motion, useReducedMotion } from "motion/react";

const LABEL_TRANSITION = {
  duration: 0.25,
  ease: "easeInOut" as const
};

const labelUp = {
  initial: { y: 0 },
  hovered: { y: "-100%" }
};

const labelDown = {
  initial: { y: "100%" },
  hovered: { y: 0 }
};

export default function LabelSlide({ children }: { children: string }) {
  const prefersReducedMotion = useReducedMotion();
  const animation = prefersReducedMotion ? "initial" : undefined;

  return (
    <>
      <span className="sr-only">{children}</span>
      <motion.span
        aria-hidden="true"
        initial="initial"
        whileHover={prefersReducedMotion ? undefined : "hovered"}
        className="relative flex h-full w-full items-center justify-center overflow-hidden"
      >
        <span className="relative block overflow-hidden whitespace-nowrap leading-normal">
          <motion.span
            animate={animation}
            variants={labelUp}
            transition={LABEL_TRANSITION}
            className="block"
          >
            {children}
          </motion.span>
          <motion.span
            animate={animation}
            variants={labelDown}
            transition={LABEL_TRANSITION}
            className="absolute inset-0 block"
          >
            {children}
          </motion.span>
        </span>
      </motion.span>
    </>
  );
}
