import type { SVGProps } from 'react';

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showWordmark?: boolean;
};

export function BrandMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        d="M8 31 18.15 9.9a2.05 2.05 0 0 1 3.7 0L32 31"
        stroke="currentColor"
        strokeWidth="3.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 23.2h14"
        stroke="currentColor"
        strokeWidth="3.7"
        strokeLinecap="round"
      />
      <circle cx="26.9" cy="12.25" r="3.1" fill="currentColor" />
    </svg>
  );
}

export default function BrandLogo({
  className = '',
  markClassName = 'h-8 w-8',
  textClassName = 'text-xl font-bold tracking-[-0.06em]',
  showWordmark = true,
}: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <BrandMark className={markClassName} />
      {showWordmark && <span className={textClassName}>ARTIUM</span>}
    </span>
  );
}
