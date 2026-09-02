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
] as const satisfies Area[];

export type AreaId = (typeof areas)[number]["id"];
