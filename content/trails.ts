export type Trail = {
  id: string;
  title: string;
  description: string;
  dropIds: string[];
  bridges: string[];
};

export const trails = [
  {
    id: "from-planets-to-people",
    title: "From Planets to People",
    description:
      "Start with strange worlds, follow the force that moves them, then trace the thread into bodies, perception, memory, and how people compare reality.",
    dropIds: [
      "space-solar-system-strange-001",
      "physics-gravity-strange-001",
      "body-spaceflight-changes-001",
      "body-space-sleep-001",
      "body-space-vision-001",
      "mind-perception-constructed-001",
      "mind-attention-missed-001",
      "mind-memory-reconstructed-001",
      "mind-confidence-wrong-001",
      "mind-social-memory-different-001",
    ],
    bridges: [
      "What keeps all these strange worlds moving?",
      "If astronauts are always falling, what does that do to their bodies?",
      "If space changes your body, can you even sleep normally there?",
      "If sleep and fluids shift in orbit, what happens to the eyes?",
      "If space can change the eyes and brain, how much of seeing is constructed in the first place?",
      "If seeing is constructed, what determines what gets through?",
      "If we do not notice everything, what happens to the things we think we remember?",
      "If memory is reconstructed, why can incorrect memories still feel so convincing?",
      "If certainty is not the same as accuracy, what happens when two people compare what they remember?",
    ],
  },
] as const satisfies Trail[];

export type TrailId = (typeof trails)[number]["id"];
