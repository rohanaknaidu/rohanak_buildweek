import type { DropContent } from "../registry";

export const spaceSolarSystemStrange001 = {
  id: "space-solar-system-strange-001",
  topicId: "space",
  areaId: "solar-system",
  title: "How Strange Is Our Solar System?",
  description: "Five quick questions about the surprising worlds closest to home.",
  status: "live",
  releaseAt: "2026-08-31T18:30:00.000Z",
  releaseOrder: 1,
  experience: {
    centralIdea:
      "The familiar planetary neighborhood behaves in deeply unintuitive ways.",
    exitUnderstanding:
      "The Solar System is not orderly in the way it looks from simple diagrams; nearby worlds spin, tilt, float, and erupt in surprising ways.",
    visualIdentity: {
      family: "cosmic",
      motif: "orbit",
      artwork: {
        hero: "solar-system-orbits",
        reveal: "planetary-surprise",
      },
    },
  },
  questions: [
    {
      id: "jupiter-shortest-day",
      prompt: "Which planet has the shortest day in the solar system?",
      options: [
        { id: "mars", label: "Mars" },
        { id: "jupiter", label: "Jupiter" },
        { id: "mercury", label: "Mercury" },
        { id: "neptune", label: "Neptune" },
      ],
      correctOptionId: "jupiter",
      reveal: {
        explanation:
          "Jupiter is enormous, but it spins incredibly fast. One day there takes only about 9.9 Earth hours, making it the shortest planetary day in our solar system.",
        source: {
          label: "NASA Jupiter Facts",
          url: "https://science.nasa.gov/jupiter/jupiter-facts/",
        },
      },
    },
    {
      id: "venus-long-day",
      prompt: "On which planet is a day longer than a year?",
      options: [
        { id: "venus", label: "Venus" },
        { id: "saturn", label: "Saturn" },
        { id: "uranus", label: "Uranus" },
        { id: "earth", label: "Earth" },
      ],
      correctOptionId: "venus",
      reveal: {
        explanation:
          "Venus rotates so slowly that one spin takes 243 Earth days. Its trip around the Sun takes about 225 Earth days, so a Venus day is longer than a Venus year.",
        source: {
          label: "NASA Venus Facts",
          url: "https://science.nasa.gov/venus/venus-facts/",
        },
      },
    },
    {
      id: "uranus-tilt",
      prompt:
        "Which planet is tilted so far that it almost rolls around the Sun on its side?",
      options: [
        { id: "saturn", label: "Saturn" },
        { id: "uranus", label: "Uranus" },
        { id: "mars", label: "Mars" },
        { id: "jupiter", label: "Jupiter" },
      ],
      correctOptionId: "uranus",
      reveal: {
        explanation:
          "Uranus is tilted by about 98 degrees compared with its orbit. Scientists think a huge collision early in its history may have knocked it sideways.",
        source: {
          label: "NASA Gravity Assist",
          url: "https://www.nasa.gov/podcasts/gravity-assist/gravity-assist-ice-giants-uranus-neptune-with-amy-simon/",
        },
      },
    },
    {
      id: "olympus-mons-world",
      prompt: "Where is Olympus Mons, the tallest volcano in the solar system?",
      options: [
        { id: "mars", label: "Mars" },
        { id: "earth", label: "Earth" },
        { id: "venus", label: "Venus" },
        { id: "io", label: "Io" },
      ],
      correctOptionId: "mars",
      reveal: {
        explanation:
          "Olympus Mons is on Mars, and it is vast. NASA describes it as rising about 17 miles, or 27 kilometers, above the surrounding landscape.",
        source: {
          label: "NASA Mars Odyssey",
          url: "https://www.nasa.gov/missions/odyssey/nasas-mars-odyssey-captures-huge-volcano-nears-100000-orbits/",
        },
      },
    },
    {
      id: "saturn-density",
      prompt:
        "Which planet is so low-density that it would float in water, if you had a big enough tub?",
      options: [
        { id: "neptune", label: "Neptune" },
        { id: "saturn", label: "Saturn" },
        { id: "jupiter", label: "Jupiter" },
        { id: "mercury", label: "Mercury" },
      ],
      correctOptionId: "saturn",
      reveal: {
        explanation:
          "Saturn is the least dense planet in the solar system. NASA notes that it is the only planet with an average density lower than water, so the famous floating idea is directionally true.",
        source: {
          label: "NASA Cassini FAQ",
          url: "https://science.nasa.gov/mission/cassini/faq/",
        },
      },
    },
  ],
} as const satisfies DropContent;
