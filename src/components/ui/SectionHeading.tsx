type Props = { index: string; eyebrow: string; title: string; id: string; className?: string };

export function SectionHeading({ index, eyebrow, title, id, className = '' }: Props) {
  return (
    <header data-reveal className={`mb-12 md:mb-16 ${className}`}>
      <p className="eyebrow">
        <span className="text-race">{index}</span> — {eyebrow}
      </p>
      <h2 id={id} className="display mt-3 text-[clamp(3rem,9vw,6.5rem)]">
        {title}
      </h2>
      <div className="kerb mt-5 w-28" aria-hidden="true" />
    </header>
  );
}
