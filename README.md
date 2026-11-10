# F1-themed portfolio

A single-page portfolio for a CS student, with a scroll-driven 3D race car.
Built with Vite, React, TypeScript, Tailwind CSS v4, React Three Fiber, GSAP and Lenis.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
npm run lint
```

## Replace the placeholders

| What | Where |
|------|-------|
| Name, bio, stats, skills, projects, experience, awards, links | `src/data/profile.ts` (everything is in this one file) |
| Page title and description for search/social | `index.html` |
| Résumé | replace `public/resume-placeholder.pdf` and update `links.resume` |
| Portrait | `src/components/sections/About.tsx` — swap the initials circle for an `<img>` |
| Project screenshots | `src/components/sections/Projects.tsx` — put an `<img>` inside the blob |
| Contact form | currently opens the visitor's email app; see the note in `Contact.tsx` to wire up a form service |

## The 3D car

- `src/components/three/Car.tsx` — an original car modelled in code (no external assets).
  To use a real model, add `public/models/car.glb` and load it there with drei's `useGLTF`.
- `src/components/three/choreography.ts` — where on the lap each section starts, and where the camera sits, for desktop and phone.
- `src/components/three/track/layout.ts` — the circuit's shape; the 3D track and the nav minimap are both generated from it.
- Visitors with "reduce motion" enabled, or without WebGL, get a static illustration and no scroll animation.

The site is not affiliated with Formula 1; it uses no official logos, fonts or liveries.
