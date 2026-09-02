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
] as const satisfies Topic[];

export type TopicId = (typeof topics)[number]["id"];
