import Image from "next/image";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ width = 40, height = 40, className }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Brisa"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
