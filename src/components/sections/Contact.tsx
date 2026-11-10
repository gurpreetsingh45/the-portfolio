import type { FormEvent } from 'react';
import { profile } from '../../data/profile';
import { PillButton } from '../ui/PillButton';

const field =
  'peer w-full border-0 border-b border-chalk/25 bg-transparent px-0 pt-6 pb-2 text-lg text-chalk placeholder-transparent transition-colors focus:border-race focus:ring-0 focus:outline-none';
const label =
  'eyebrow pointer-events-none absolute top-0 left-0 transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:tracking-normal peer-placeholder-shown:normal-case peer-focus:top-0 peer-focus:text-xs peer-focus:tracking-[0.2em] peer-focus:uppercase';

export function Contact() {
  // No backend yet: the form opens the visitor's email app with the message pre-filled.
  // Swap this for a form service (Formspree, Netlify Forms, …) when you have one.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = `Portfolio message from ${data.get('name')}`;
    const body = `${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section id="contact" data-pose="contact" aria-labelledby="contact-title" className="relative z-10 pt-24 md:pt-36">
      <div className="wrap text-center">
        <p data-reveal className="eyebrow">
          <span className="text-race">06</span> — Team radio
        </p>
        <h2 data-reveal id="contact-title" className="display mx-auto mt-4 max-w-4xl text-[clamp(3rem,10vw,7.5rem)]">
          Looking for a <span className="text-race">seat</span>. Let’s talk.
        </h2>
        <p data-reveal className="mx-auto mt-6 max-w-xl text-lg text-chalk/80">
          I am open to internships and graduate roles. If you think I could be a good fit for your team, I would love to
          hear from you.
        </p>

        <div data-reveal className="mt-8 flex flex-wrap justify-center gap-3">
          <PillButton href={`mailto:${profile.email}`}>{profile.email}</PillButton>
          <PillButton href={profile.links.resume} variant="ghost" target="_blank" rel="noreferrer">
            Résumé <span aria-hidden="true">↓</span>
          </PillButton>
        </div>

        <ul data-reveal className="mt-6 flex justify-center gap-8">
          {(
            [
              ['GitHub', profile.links.github],
              ['LinkedIn', profile.links.linkedin],
            ] as const
          ).map(([name, href]) => (
            <li key={name}>
              <a href={href} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-1.5 font-medium underline decoration-race decoration-2 underline-offset-8 hover:text-race">
                {name} <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>

        <form data-reveal onSubmit={onSubmit} className="mx-auto mt-16 grid max-w-xl gap-8 text-left sm:grid-cols-2">
          <div className="relative">
            <input id="c-name" name="name" required autoComplete="name" placeholder="Name" className={field} />
            <label htmlFor="c-name" className={label}>Name</label>
          </div>
          <div className="relative">
            <input id="c-email" name="email" type="email" required autoComplete="email" placeholder="Email" className={field} />
            <label htmlFor="c-email" className={label}>Email</label>
          </div>
          <div className="relative sm:col-span-2">
            <textarea id="c-message" name="message" required rows={3} placeholder="Message" className={`${field} resize-none`} />
            <label htmlFor="c-message" className={label}>Message</label>
          </div>
          <button
            type="submit"
            className="min-h-12 justify-self-start rounded-full bg-chalk px-7 font-display text-lg font-semibold tracking-wide text-carbon uppercase italic transition-colors hover:bg-race sm:col-span-2"
          >
            Send message
          </button>
        </form>
      </div>
      {/* Room for the car to line up head-on at the end of the page */}
      <div data-pose="finish" aria-hidden="true" className="h-[52svh]" />
    </section>
  );
}
