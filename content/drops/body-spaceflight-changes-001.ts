import type { DropContent } from "../registry";

export const bodySpaceflightChanges001 = {
  id: "body-spaceflight-changes-001",
  topicId: "body",
  areaId: "spaceflight",
  title: "What Happens to Your Body in Space?",
  description:
    "Five quick challenges about what microgravity does to the human body.",
  status: "live",
  releaseAt: "2026-09-02T18:30:00.000Z",
  releaseOrder: 3,
  experience: {
    centralIdea:
      "The human body is tuned to Earth gravity and adapts quickly when that environment disappears.",
    exitUnderstanding:
      "Microgravity changes fluids, bones, muscles, height, and balance because the body is constantly responding to its physical environment.",
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
      id: "fluid-shifts-head",
      prompt: "In weightlessness, where do body fluids tend to shift?",
      options: [
        { id: "toward-feet", label: "Down toward the feet" },
        { id: "toward-head", label: "Up toward the head" },
        { id: "out-through-skin", label: "Out through the skin" },
        { id: "not-at-all", label: "They do not shift" },
      ],
      correctOptionId: "toward-head",
      reveal: {
        discovery: "In microgravity, body fluids can shift toward the head.",
        explanation:
          "On Earth, gravity helps pull fluids toward the lower body. In microgravity, fluids shift toward the head, which can make astronauts feel facial fullness and can affect the eyes and brain.",
        source: {
          label: "NASA Cardiovascular and Vision",
          url: "https://www.nasa.gov/directorates/esdmd/hhp/cardiovascular-and-vision/",
        },
      },
    },
    {
      id: "bones-lose-density",
      prompt: "What can happen to weight-bearing bones during months in space?",
      options: [
        { id: "denser", label: "They usually become denser" },
        { id: "less-dense", label: "They can lose density" },
        { id: "unchanged", label: "They stay unchanged" },
        { id: "turn-cartilage", label: "They turn into cartilage" },
      ],
      correctOptionId: "less-dense",
      reveal: {
        discovery: "Weight-bearing bones can lose density during months in space.",
        explanation:
          "Bones are living tissue that respond to load. In microgravity, weight-bearing bones do less support work, so bone breakdown can outpace rebuilding unless astronauts use countermeasures.",
        source: {
          label: "NASA Bone Changes",
          url: "https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/",
        },
      },
    },
    {
      id: "muscles-weaken",
      prompt: "Why do astronauts exercise so much on the space station?",
      options: [
        { id: "stay-warm", label: "To stay warm in the cold cabin" },
        { id: "avoid-muscle-loss", label: "To reduce muscle and bone loss" },
        { id: "make-oxygen", label: "To make extra oxygen" },
        { id: "sleep-better-only", label: "Only to sleep better" },
      ],
      correctOptionId: "avoid-muscle-loss",
      reveal: {
        discovery: "Astronauts exercise in space to reduce muscle and bone loss.",
        explanation:
          "Muscles that normally work against Earth's gravity do not have to work as hard in microgravity. Without exercise, astronauts lose muscle mass faster than they would on Earth.",
        source: {
          label: "NASA Body in Space",
          url: "https://www.nasa.gov/humans-in-space/the-human-body-in-space/",
        },
      },
    },
    {
      id: "spine-grows-taller",
      prompt: "What can happen to an astronaut's height in space?",
      options: [
        { id: "temporarily-taller", label: "They can become temporarily taller" },
        { id: "permanently-shorter", label: "They permanently become shorter" },
        { id: "doubles", label: "Their height doubles" },
        { id: "never-changes", label: "Height never changes in space" },
      ],
      correctOptionId: "temporarily-taller",
      reveal: {
        discovery: "Astronauts can become temporarily taller in space.",
        explanation:
          "Without the usual compression from Earth's gravity, the spine can straighten and elongate. NASA notes that crew members can increase in height by as much as 3% in space.",
        source: {
          label: "NASA Bone Changes",
          url: "https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/",
        },
      },
    },
    {
      id: "balance-after-landing",
      prompt: "After returning from space, which ability may need readapting?",
      options: [
        { id: "taste-sweetness", label: "Tasting sweetness" },
        { id: "balance-control", label: "Balance and orientation" },
        { id: "hair-color", label: "Hair color" },
        { id: "fingerprints", label: "Fingerprints" },
      ],
      correctOptionId: "balance-control",
      reveal: {
        discovery: "Astronauts may need to readapt their balance after returning from space.",
        explanation:
          "Your balance system is tuned by gravity. NASA uses functional task testing after landing to detect and improve balance control as astronauts readapt to a gravitational surface.",
        source: {
          label: "NASA Body in Space",
          url: "https://www.nasa.gov/humans-in-space/the-human-body-in-space/",
        },
      },
    },
  ],
} as const satisfies DropContent;
