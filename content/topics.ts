export type Topic = {
  id: string;
  name: string;
  description: string;
};

export const topics = [
  {
    id: "space",
    name: "Space",
    description: "Surprising facts about the universe and our place in it.",
  },
  {
    id: "physics",
    name: "Physics",
    description: "Surprising rules behind motion, forces, time, and reality.",
  },
  {
    id: "body",
    name: "Body",
    description:
      "Surprising ways human bodies adapt, break expectations, and keep working.",
  },
  {
    id: "mind",
    name: "Mind",
    description:
      "Surprising ways perception, attention, memory, and confidence shape reality.",
  },
] as const satisfies Topic[];

export type TopicId = (typeof topics)[number]["id"];
