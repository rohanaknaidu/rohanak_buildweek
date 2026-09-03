import type { DropContent } from "../registry";

export const bodySpaceSleep001 = {
  id: "body-space-sleep-001",
  topicId: "body",
  areaId: "spaceflight",
  title: "Can You Sleep Normally in Space?",
  description:
    "Five quick challenges about sleep, body clocks, light, noise, and fatigue in space.",
  status: "live",
  releaseAt: "2026-09-03T18:30:00.000Z",
  releaseOrder: 4,
  experience: {
    centralIdea:
      "Sleep in space is not just about being tired; it is shaped by light, isolation, schedules, and the body's internal clock.",
    exitUnderstanding:
      "Astronaut sleep depends on engineered routines and environments because spaceflight can disrupt circadian rhythm, alertness, and recovery.",
    visualIdentity: {
      family: "organic",
      motif: "microgravity-body",
      artwork: {
        hero: "body-in-microgravity",
        reveal: "fluid-shift",
      },
    },
  },
  questions: [
    {
      id: "sleep-clock-space",
      prompt:
        "What internal body system can spaceflight disrupt when light, work, and sleep schedules change?",
      options: [
        { id: "circadian-rhythm", label: "Circadian rhythm" },
        { id: "bone-density", label: "Bone density only" },
        { id: "fingerprints", label: "Fingerprints" },
        { id: "blood-type", label: "Blood type" },
      ],
      correctOptionId: "circadian-rhythm",
      reveal: {
        discovery: "Spaceflight can disrupt the body's circadian rhythm.",
        explanation:
          "Spaceflight can disturb the body's internal clock, called the circadian rhythm. NASA studies sleep and alertness because changed light cycles, workload, stress, and confined spaces can all affect astronaut rest.",
        source: {
          label: "NASA Human Body in Space",
          url: "https://www.nasa.gov/humans-in-space/the-human-body-in-space/",
        },
      },
    },
    {
      id: "space-station-lighting",
      prompt:
        "Why does the space station use carefully designed LED lighting?",
      options: [
        { id: "make-plants-glow", label: "To make plants glow brighter" },
        { id: "help-body-clock", label: "To support sleep, alertness, and body clocks" },
        { id: "replace-gravity", label: "To replace gravity at night" },
        { id: "hide-earth", label: "To hide Earth from the windows" },
      ],
      correctOptionId: "help-body-clock",
      reveal: {
        discovery: "Space station lighting is designed to support sleep, alertness, and body clocks.",
        explanation:
          "Lighting is part of astronaut health. NASA notes that newer LED lighting on the space station helps align circadian rhythms and improve sleep, alertness, and performance.",
        source: {
          label: "NASA Human Body in Space",
          url: "https://www.nasa.gov/humans-in-space/the-human-body-in-space/",
        },
      },
    },
    {
      id: "fatigue-self-test",
      prompt:
        "What kind of short test can astronauts use to check how fatigue is affecting them?",
      options: [
        { id: "attention-vigilance", label: "Vigilance and attention test" },
        { id: "taste-test", label: "Sweetness taste test" },
        { id: "shoe-size", label: "Shoe-size test" },
        { id: "hair-growth", label: "Hair-growth test" },
      ],
      correctOptionId: "attention-vigilance",
      reveal: {
        discovery: "Astronauts can use short attention tests to check fatigue effects.",
        explanation:
          "Fatigue can quietly change performance. NASA describes a 10-minute self-test of vigilance and attention used to assess how fatigue affects astronauts during missions.",
        source: {
          label: "NASA Human Body in Space",
          url: "https://www.nasa.gov/humans-in-space/the-human-body-in-space/",
        },
      },
    },
    {
      id: "mars-day-sleep",
      prompt:
        "A day on Mars is about how much longer than an Earth day?",
      options: [
        { id: "37-minutes", label: "About 37 minutes longer" },
        { id: "six-hours", label: "About 6 hours longer" },
        { id: "half-day", label: "About 12 hours longer" },
        { id: "same", label: "Exactly the same length" },
      ],
      correctOptionId: "37-minutes",
      reveal: {
        discovery: "A day on Mars is about 37 minutes longer than a day on Earth.",
        explanation:
          "NASA flags a 37-minute extended day on Mars as one factor that can alter astronauts' biological clocks. That sounds small, but repeated schedule shifts can matter for sleep and alertness.",
        source: {
          label: "NASA Human Body in Space",
          url: "https://www.nasa.gov/humans-in-space/the-human-body-in-space/",
        },
      },
    },
    {
      id: "space-sleep-environment",
      prompt:
        "Which spaceflight condition can make quality sleep harder?",
      options: [
        { id: "noisy-confined", label: "A small, noisy, confined environment" },
        { id: "too-much-rain", label: "Rain hitting the roof" },
        { id: "heavy-blankets", label: "Blankets becoming too heavy" },
        { id: "fresh-wind", label: "Too much fresh wind at night" },
      ],
      correctOptionId: "noisy-confined",
      reveal: {
        discovery: "Small, noisy, confined spacecraft environments can make quality sleep harder.",
        explanation:
          "Astronaut sleep is affected by more than bedtime. NASA points to different dark and light cycles, small and noisy environments, heavy workloads, and stress as factors that can alter rest.",
        source: {
          label: "NASA Human Body in Space",
          url: "https://www.nasa.gov/humans-in-space/the-human-body-in-space/",
        },
      },
    },
  ],
} as const satisfies DropContent;
