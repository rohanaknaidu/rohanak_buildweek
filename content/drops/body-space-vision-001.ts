import type { DropContent } from "../registry";

export const bodySpaceVision001 = {
  id: "body-space-vision-001",
  topicId: "body",
  areaId: "spaceflight",
  title: "Can Space Change How You See?",
  description:
    "Five quick challenges about vision, pressure, balance, and adaptation after spaceflight.",
  status: "live",
  releaseAt: "2026-09-04T18:30:00.000Z",
  releaseOrder: 5,
  experience: {
    centralIdea:
      "Microgravity can affect vision and orientation because fluids and pressure behave differently away from Earth.",
    exitUnderstanding:
      "Spaceflight can influence the eyes, brain, and balance system; the body is not just floating, it is adapting.",
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
      id: "fluid-shift-vision",
      prompt:
        "One proposed contributor to astronaut vision changes is fluid shifting toward the...",
      options: [
        { id: "head", label: "Head" },
        { id: "knees", label: "Knees" },
        { id: "hands-only", label: "Hands only" },
        { id: "skin-surface", label: "Skin surface" },
      ],
      correctOptionId: "head",
      reveal: {
        discovery: "In microgravity, fluid can shift toward the head and may affect vision.",
        explanation:
          "In microgravity, fluids can shift toward the head. NASA studies how that headward fluid shift may contribute to changes in the eyes and brain during spaceflight.",
        source: {
          label: "NASA Cardiovascular and Vision",
          url: "https://www.nasa.gov/directorates/esdmd/hhp/cardiovascular-and-vision/",
        },
      },
    },
    {
      id: "sans-meaning",
      prompt:
        "NASA uses the term SANS for a spaceflight condition involving which systems?",
      options: [
        { id: "vision", label: "Eyes, vision, and brain" },
        { id: "digestion", label: "Digestion only" },
        { id: "hair", label: "Hair growth" },
        { id: "fingerprints", label: "Fingerprints" },
      ],
      correctOptionId: "vision",
      reveal: {
        discovery: "SANS is a spaceflight condition involving the eyes, vision, and brain.",
        explanation:
          "SANS stands for Spaceflight Associated Neuro-ocular Syndrome. It describes eye and vision-related changes NASA monitors in astronauts during and after spaceflight.",
        source: {
          label: "NASA Cardiovascular and Vision",
          url: "https://www.nasa.gov/directorates/esdmd/hhp/cardiovascular-and-vision/",
        },
      },
    },
    {
      id: "balance-readaptation",
      prompt:
        "After returning from space, why can balance feel strange again?",
      options: [
        { id: "gravity-readaptation", label: "The body must readapt to gravity" },
        { id: "no-air-earth", label: "Earth has no air after landing" },
        { id: "eyes-close", label: "Astronauts cannot open their eyes" },
        { id: "bones-magnetized", label: "Bones become magnetized" },
      ],
      correctOptionId: "gravity-readaptation",
      reveal: {
        discovery: "After spaceflight, the body may need to readapt its balance to gravity.",
        explanation:
          "Balance and orientation depend on gravity. NASA tracks functional tasks after landing because astronauts need to readapt to moving in a gravitational environment.",
        source: {
          label: "NASA Human Body in Space",
          url: "https://www.nasa.gov/humans-in-space/the-human-body-in-space/",
        },
      },
    },
    {
      id: "vision-risk-duration",
      prompt:
        "Why do long missions make vision research especially important?",
      options: [
        { id: "longer-exposure", label: "The body spends more time adapting to microgravity" },
        { id: "space-darker", label: "Space becomes darker each month" },
        { id: "helmets-shrink", label: "Helmets slowly shrink" },
        { id: "mars-lenses", label: "Mars requires different eye color" },
      ],
      correctOptionId: "longer-exposure",
      reveal: {
        discovery: "Longer missions mean longer exposure to the spaceflight environment.",
        explanation:
          "Longer missions mean longer exposure to the spaceflight environment. NASA studies vision and cardiovascular risks because those changes matter for astronaut health on extended missions.",
        source: {
          label: "NASA Cardiovascular and Vision",
          url: "https://www.nasa.gov/directorates/esdmd/hhp/cardiovascular-and-vision/",
        },
      },
    },
    {
      id: "eye-brain-link",
      prompt:
        "Why is astronaut vision research not only about the eyeball itself?",
      options: [
        { id: "brain-fluid-pressure", label: "The brain, fluids, and pressure may also be involved" },
        { id: "teeth-control", label: "Teeth control distance vision" },
        { id: "skin-color", label: "Skin color determines focus" },
        { id: "moonlight-only", label: "Only moonlight affects vision" },
      ],
      correctOptionId: "brain-fluid-pressure",
      reveal: {
        discovery: "Astronaut vision research involves the brain, fluids, and pressure, not only the eyeball.",
        explanation:
          "NASA treats spaceflight vision changes as neuro-ocular, meaning the nervous system and eyes are considered together. Fluid shifts and pressure around the head may matter, not just the eye alone.",
        source: {
          label: "NASA Cardiovascular and Vision",
          url: "https://www.nasa.gov/directorates/esdmd/hhp/cardiovascular-and-vision/",
        },
      },
    },
  ],
} as const satisfies DropContent;
