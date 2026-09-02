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
      "Start with strange worlds, follow the force that moves them, then see what happens when human bodies leave Earth.",
    dropIds: [
      "space-solar-system-strange-001",
      "physics-gravity-strange-001",
      "body-spaceflight-changes-001",
    ],
    bridges: [
      "What keeps all these strange worlds moving?",
      "If astronauts are always falling, what does that do to their bodies?",
    ],
  },
] as const satisfies Trail[];

export type TrailId = (typeof trails)[number]["id"];
