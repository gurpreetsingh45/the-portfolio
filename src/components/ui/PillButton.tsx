import { useRef, type AnchorHTMLAttributes, type PointerEvent } from 'react';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: 'primary' | 'ghost' };

/** Pill-shaped link button with a subtle magnetic pull on mouse hover. */
export function PillButton({ variant = 'primary', className = '', children, ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.18;
    const y = (e.clientY - r.top - r.height / 2) * 0.3;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  const look =
    variant === 'primary'
      ? 'bg-race text-carbon hover:bg-chalk'
      : 'text-chalk ring-1 ring-inset ring-chalk/30 hover:ring-chalk';

  return (
    <a
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 font-display text-lg font-semibold tracking-wide uppercase italic transition-[background-color,box-shadow,transform] duration-200 ease-out ${look} ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}
