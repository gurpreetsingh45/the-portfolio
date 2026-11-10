/** Mutable state shared between the DOM and the 3D scene (read every frame, no re-renders). */
export const DEFAULT_ACCENT = '#FF2A1F';

export const scene = {
  pointer: { x: 0, y: 0 },
  drag: 0,
  dragging: false,
  accent: DEFAULT_ACCENT,
  velocity: 0,
};
