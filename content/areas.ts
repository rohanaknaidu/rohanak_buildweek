export type Area = {
  id: string;
  topicId: string;
  name: string;
};

export const areas = [
  {
    id: "solar-system",
    topicId: "space",
    name: "Solar System",
  },
  {
    id: "gravity",
    topicId: "physics",
    name: "Gravity",
  },
  {
    id: "spaceflight",
    topicId: "body",
    name: "Spaceflight",
  },
] as const satisfies Area[];

export type AreaId = (typeof areas)[number]["id"];
