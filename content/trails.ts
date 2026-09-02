export type Trail = {
  id: string;
  title: string;
  description: string;
  dropIds: string[];
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
  },
] as const satisfies Trail[];

export type TrailId = (typeof trails)[number]["id"];
