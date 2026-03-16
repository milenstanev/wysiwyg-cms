import { CONTAINER_CLASS, CONTENT_PADDING_CLASS } from "@/lib/layout/constants";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Use "narrow" for reading-focused content (e.g. single column) */
  variant?: "default" | "narrow";
}

const NARROW_WIDTH = "max-w-2xl";

export function Container({ children, className = "", variant = "default" }: ContainerProps) {
  const base = variant === "narrow"
    ? `mx-auto w-full ${NARROW_WIDTH} ${CONTENT_PADDING_CLASS}`
    : CONTAINER_CLASS;
  return <div className={`${base} ${className}`}>{children}</div>;
}
