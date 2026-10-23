import { useEffect, useState } from 'react';

const CHARS = '!<>-_\\/[]{}—=+*^?#01ABCDEF0123456789';

/** Animated "hacker" text scramble effect. */
export function ScrambleText({
  text,
  className = '',
  duration = 1.4,
}: {
  text: string;
  className?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    const target = text;
    setDisplay('');
    let frame = 0;
    const total = Math.max(20, Math.floor(duration * 60));
    let raf = 0;
    let interval: ReturnType<typeof setInterval>;

    function tick() {
      frame++;
      const revealed = Math.floor((frame / total) * target.length);
      let out = '';
      for (let i = 0; i < target.length; i++) {
        if (i < revealed || target[i] === ' ') {
          out += target[i];
        } else {
          out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      setDisplay(out);
      if (frame >= total) {
        setDisplay(target);
        clearInterval(interval);
      }
    }

    interval = setInterval(tick, 16);
    raf = requestAnimationFrame(() => undefined);
    void raf;
    return () => clearInterval(interval);
  }, [text, duration]);

  return <span className={className}>{display || text}</span>;
}
