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
  {
    id: "perception",
    topicId: "mind",
    name: "Perception",
  },
  {
    id: "attention",
    topicId: "mind",
    name: "Attention",
  },
  {
    id: "memory",
    topicId: "mind",
    name: "Memory",
  },
  {
    id: "confidence",
    topicId: "mind",
    name: "Confidence",
  },
  {
    id: "social-memory",
    topicId: "mind",
    name: "Social Memory",
  },
] as const satisfies Area[];

export type AreaId = (typeof areas)[number]["id"];
