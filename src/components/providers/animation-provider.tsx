"use client";

import { ReactNode } from "react";
import { LazyMotion, MotionConfig, domAnimation, useReducedMotion } from "motion/react";

/**
 * Provee animaciones accesibles y con lazy-loading.
 * - LazyMotion carga el motor de animaciones solo cuando se necesita
 *   (ahorra ~30kb en el bundle inicial).
 * - useReducedMotion respeta la preferencia de accesibilidad
 *   "Reduce Motion" del sistema operativo (WCAG 2.3.3).
 */
export function AnimationProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion={prefersReducedMotion ? "always" : "never"}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
