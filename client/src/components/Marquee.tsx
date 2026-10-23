import type { ReactNode } from 'react';

/** Seamless infinite marquee. */
export function Marquee({
  children,
  reverse = false,
  className = '',
  pauseOnHover = true,
}: {
  children: ReactNode;
  reverse?: boolean;
  className?: string;
  pauseOnHover?: boolean;
}) {
  return (
    <div className={`group relative flex overflow-hidden ${className}`}>
      <div
        className={`flex shrink-0 items-center ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''} ${
          reverse ? 'marquee-track-rev' : 'marquee-track'
        }`}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

export function MarqueeItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`flex items-center ${className}`}>{children}</span>;
}
