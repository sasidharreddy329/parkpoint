import { ReactNode, CSSProperties } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "scale" | "fade";

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  threshold?: number;
}

const hiddenTransform: Record<Direction, string> = {
  up: "translate3d(0, 32px, 0)",
  down: "translate3d(0, -32px, 0)",
  left: "translate3d(32px, 0, 0)",
  right: "translate3d(-32px, 0, 0)",
  scale: "scale(0.92)",
  fade: "none",
};

/**
 * Wraps children with a scroll-triggered entrance animation.
 * Elements glide into place once they enter the viewport.
 */
const Reveal = ({
  children,
  direction = "up",
  delay = 0,
  duration = 700,
  className,
  as: Tag = "div",
  threshold,
}: RevealProps) => {
  const { ref, visible } = useScrollReveal<HTMLElement>({ threshold });

  const style: CSSProperties = {
    transform: visible ? "translate3d(0,0,0) scale(1)" : hiddenTransform[direction],
    opacity: visible ? 1 : 0,
    transition: `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, opacity ${duration}ms ease-out ${delay}ms`,
    willChange: "transform, opacity",
  };

  const Component = Tag as any;
  return (
    <Component ref={ref} style={style} className={cn(className)}>
      {children}
    </Component>
  );
};

export default Reveal;
