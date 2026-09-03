import type { DropContent } from "../registry";

export const physicsGravityStrange001 = {
  id: "physics-gravity-strange-001",
  topicId: "physics",
  areaId: "gravity",
  title: "Gravity Is Stranger Than You Think",
  description:
    "Five quick challenges about falling, orbiting, tides, weight, and time.",
  status: "live",
  releaseAt: "2026-09-01T18:30:00.000Z",
  releaseOrder: 2,
  experience: {
    centralIdea:
      "Orbit, falling, weight, tides, and time are connected by gravity.",
    exitUnderstanding:
      "Gravity is not just things falling downward; it shapes motion, weight, oceans, orbits, and even time.",
    visualIdentity: {
      family: "gravitational",
      motif: "falling-arc",
      artwork: {
        hero: "gravity-freefall",
        reveal: "orbital-fall",
      },
    },
  },
  questions: [
    {
      id: "iss-still-gravity",
      prompt:
        "Astronauts float on the International Space Station because they are...",
      options: [
        { id: "outside-earth-gravity", label: "Outside Earth's gravity" },
        { id: "falling-around-earth", label: "Falling around Earth" },
        { id: "pulled-by-the-moon", label: "Pulled upward by the Moon" },
        { id: "inside-a-vacuum", label: "Floating because space is a vacuum" },
      ],
      correctOptionId: "falling-around-earth",
      reveal: {
        explanation:
          "The space station is still deep inside Earth's gravity. Astronauts float because the station, the crew, and everything inside are falling around Earth together, so nothing presses on the floor like it does at home.",
        source: {
          label: "NASA Microgravity",
          url: "https://www.nasa.gov/learning-resources/for-kids-and-students/what-is-microgravity-grades-5-8/",
        },
      },
    },
    {
      id: "orbit-is-falling",
      prompt: "What keeps a spacecraft in orbit after its rocket boost?",
      options: [
        { id: "constant-engine", label: "Its engine keeps pushing nonstop" },
        { id: "balanced-magnetism", label: "Earth's magnetism balances it" },
        { id: "continuous-freefall", label: "It keeps falling around the planet" },
        { id: "no-force", label: "No force acts on it in space" },
      ],
      correctOptionId: "continuous-freefall",
      reveal: {
        explanation:
          "Orbit is not hovering. A spacecraft is moving sideways so fast that, as gravity pulls it downward, the ground curves away beneath it and it keeps falling around the planet.",
        source: {
          label: "NASA Basics of Space Flight",
          url: "https://science.nasa.gov/learn/basics-of-space-flight/chapter3-4/",
        },
      },
    },
    {
      id: "moon-dominates-tides",
      prompt: "Which object has the bigger effect on Earth's ocean tides?",
      options: [
        { id: "sun", label: "The Sun, because it is far more massive" },
        { id: "moon", label: "The Moon, because it is much closer" },
        { id: "jupiter", label: "Jupiter, because it is the largest planet" },
        { id: "earth-core", label: "Earth's core, because it is under the oceans" },
      ],
      correctOptionId: "moon",
      reveal: {
        explanation:
          "The Sun pulls on Earth strongly, but tides depend heavily on how much the pull changes across Earth. The Moon is much closer, so its tide-making effect is stronger than the Sun's.",
        source: {
          label: "NOAA Tides",
          url: "https://oceanservice.noaa.gov/education/tutorial_tides/tides02_cause.html",
        },
      },
    },
    {
      id: "weight-changes-location",
      prompt: "If your mass stays the same, can your weight change?",
      options: [
        { id: "no-same-everywhere", label: "No, weight is the same everywhere" },
        { id: "yes-gravity-varies", label: "Yes, gravity changes with location" },
        { id: "only-age", label: "Only as you get older" },
        { id: "only-temperature", label: "Only when temperature changes" },
      ],
      correctOptionId: "yes-gravity-varies",
      reveal: {
        explanation:
          "Mass is how much matter you have, but weight is the pull of gravity on that mass. NASA notes that weight varies depending on whether you are on Earth, the Moon, or in orbit, while mass stays the same.",
        source: {
          label: "NASA Microgravity",
          url: "https://www.nasa.gov/centers-and-facilities/glenn/what-is-microgravity/",
        },
      },
    },
    {
      id: "gravity-time-gps",
      prompt: "Why does GPS need Einstein's relativity to stay accurate?",
      options: [
        { id: "satellite-light", label: "Satellites use a different kind of light" },
        { id: "gravity-time", label: "Gravity changes how clocks tick" },
        { id: "earth-flat-map", label: "Earth maps are drawn flat" },
        { id: "moon-blocks-signal", label: "The Moon sometimes blocks signals" },
      ],
      correctOptionId: "gravity-time",
      reveal: {
        explanation:
          "Gravity affects time. GPS satellites experience time slightly differently from clocks on Earth, and those tiny clock differences would quickly become miles of location error if GPS did not correct for relativity.",
        source: {
          label: "NASA Einstein and GPS",
          url: "https://science.nasa.gov/solar-system/10-things-einstein-got-right/",
        },
      },
    },
  ],
} as const satisfies DropContent;
