/**
 * ALL site content lives in this file.
 * Everything below is PLACEHOLDER text — replace it with your own details.
 * (Also update the <title> and meta description in /index.html.)
 */

export type SkillLevel = "purple" | "green" | "yellow";

export const profile = {
  name: { first: "Gurpreet", last: "Singh" },
  initials: "GS",
  carNumber: "45",
  role: "Computer Science Student · Aspiring Software Engineer",
  pitch:
    "I build fast, reliable software and I am looking for a team to race with. Open to internships and graduate roles.",
  status: "Available for Summer 2027 internships",
  location: "Toronto, Canada",
  email: "your.email@example.com",
  links: {
    github: "https://github.com/your-username",
    linkedin: "https://www.linkedin.com/in/your-username",
    resume: "/resume-placeholder.pdf",
  },

  bio: [
    "I am a third-year Computer Science student at Placeholder University who likes turning ideas into things people can actually use. Most of my time goes into full-stack web projects, with a growing interest in systems and performance.",
    "Outside of class I contribute to the university coding club, take part in hackathons, and watch far too much motorsport. I am looking for a first role where I can learn from experienced engineers and ship real work.",
  ],

  stats: [
    { value: "2027", label: "Graduation" },
    { value: "12", label: "Projects shipped" },
    { value: "5", label: "Languages" },
    { value: "3.8", label: "GPA / 4.0" },
  ],

  /**
   * Sponsor-style decals on the car: your stack, where a race team would put its sponsors.
   * Keep names short (they are fitted to the panel). `color` is the small flash beside the name.
   */
  livery: {
    sidepod: { name: "Python", color: "#FFD43B" }, // the title sponsor: your strongest language
    engineCover: { name: "TypeScript", color: "#3178C6" },
    nose: { name: "React", color: "#61DAFB" },
    cockpit: { name: "Rust", color: "#F46623" },
    /** Small row under the sidepod name: libraries and tools. */
    strip: ["Node.js", "PostgreSQL", "Docker", "Three.js"],
  },

  /** level: purple = strongest, green = comfortable, yellow = currently learning */
  skills: [
    {
      group: "Languages",
      seasons: 3,
      items: [
        { name: "Python", level: "purple" },
        { name: "TypeScript", level: "purple" },
        { name: "Java", level: "green" },
        { name: "C++", level: "green" },
        { name: "Rust", level: "yellow" },
      ],
    },
    {
      group: "Frontend",
      seasons: 2,
      items: [
        { name: "React", level: "purple" },
        { name: "HTML & CSS", level: "purple" },
        { name: "Tailwind", level: "green" },
        { name: "Three.js", level: "yellow" },
      ],
    },
    {
      group: "Backend",
      seasons: 2,
      items: [
        { name: "Node.js", level: "green" },
        { name: "PostgreSQL", level: "green" },
        { name: "REST APIs", level: "purple" },
        { name: "Docker", level: "yellow" },
      ],
    },
    {
      group: "Tools",
      seasons: 3,
      items: [
        { name: "Git & GitHub", level: "purple" },
        { name: "Linux", level: "green" },
        { name: "CI / CD", level: "yellow" },
        { name: "Figma", level: "green" },
      ],
    },
  ] as {
    group: string;
    seasons: number;
    items: { name: string; level: SkillLevel }[];
  }[],

  projects: [
    {
      title: "Project One",
      tagline: "A one-line description of what this project does.",
      problem: "The problem you noticed and who had it.",
      build: "What you designed and built, and the hard part you solved.",
      result: "A measurable outcome: users, speed-up, grade, or award.",
      stack: ["React", "Node.js", "PostgreSQL"],
      repo: "https://github.com/your-username/project-one",
      live: "https://example.com",
      color: "#FF2A1F",
    },
    {
      title: "Project Two",
      tagline: "A one-line description of what this project does.",
      problem: "The problem you noticed and who had it.",
      build: "What you designed and built, and the hard part you solved.",
      result: "A measurable outcome: users, speed-up, grade, or award.",
      stack: ["Python", "FastAPI", "Docker"],
      repo: "https://github.com/your-username/project-two",
      live: "",
      color: "#B45CFF",
    },
    {
      title: "Project Three",
      tagline: "A one-line description of what this project does.",
      problem: "The problem you noticed and who had it.",
      build: "What you designed and built, and the hard part you solved.",
      result: "A measurable outcome: users, speed-up, grade, or award.",
      stack: ["C++", "OpenGL"],
      repo: "https://github.com/your-username/project-three",
      live: "",
      color: "#19D27C",
    },
    {
      title: "Project Four",
      tagline: "A one-line description of what this project does.",
      problem: "The problem you noticed and who had it.",
      build: "What you designed and built, and the hard part you solved.",
      result: "A measurable outcome: users, speed-up, grade, or award.",
      stack: ["TypeScript", "Three.js", "Vite"],
      repo: "https://github.com/your-username/project-four",
      live: "https://example.com",
      color: "#FFD23F",
    },
  ],

  timeline: [
    {
      period: "2023 — Present",
      title: "BSc Computer Science",
      place: "Placeholder University",
      detail:
        "Relevant coursework: Data Structures, Algorithms, Operating Systems, Databases, Computer Networks.",
    },
    {
      period: "Summer 2025",
      title: "Software Engineering Intern",
      place: "Placeholder Company",
      detail:
        "One or two lines on what you built, the tools you used, and the impact it had.",
    },
    {
      period: "2024 — Present",
      title: "Technical Lead",
      place: "University Coding Club",
      detail:
        "Run weekly workshops and mentor first-year students through their first projects.",
    },
    {
      period: "2024",
      title: "Teaching Assistant",
      place: "Intro to Programming",
      detail: "Held lab sessions and office hours for a class of 120 students.",
    },
  ],

  achievements: [
    {
      title: "Winner — Placeholder Hackathon",
      detail: "Built a working prototype in 36 hours with a team of four.",
      year: "2025",
    },
    {
      title: "Dean’s List",
      detail: "Top 10% of the cohort for academic performance.",
      year: "2024",
    },
    {
      title: "Cloud Practitioner Certification",
      detail: "Placeholder certification from a cloud provider.",
      year: "2024",
    },
  ],
};

/** Navigation uses plain labels; the racing names appear as section eyebrows. */
export const sections = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "awards", label: "Awards" },
  { id: "contact", label: "Contact" },
];
