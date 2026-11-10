import { profile } from '../../data/profile';

export function Footer() {
  return (
    <footer className="relative z-10 overflow-clip pt-10">
      <div className="chequer absolute inset-x-0 bottom-0 h-40 opacity-25" aria-hidden="true" />
      <div className="wrap relative flex flex-col items-center justify-between gap-3 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))] text-sm text-mute sm:flex-row">
        <p>
          © {new Date().getFullYear()} {profile.name.first} {profile.name.last}. Not affiliated with Formula 1.
        </p>
        <a href="#top" className="flex min-h-11 items-center gap-2 hover:text-chalk">
          Back to the grid <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  );
}
