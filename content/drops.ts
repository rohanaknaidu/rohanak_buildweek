export type TopicId = "space";
export type AreaId = "solar-system";

export type Drop = {
  id: string;
  topic: {
    id: TopicId;
    title: string;
  };
  area: {
    id: AreaId;
    title: string;
  };
  title: string;
  teaser: string;
  releaseAt: string;
  questions: Question[];
};

export type Question = {
  id: string;
  prompt: string;
  options: AnswerOption[];
  correctOptionId: string;
  reveal: {
    explanation: string;
    sourceLabel: string;
    sourceUrl: string;
  };
};

export type AnswerOption = {
  id: string;
  label: string;
};

export const drops = [
  {
    id: "space-solar-system-strange-001",
    topic: {
      id: "space",
      title: "Space",
    },
    area: {
      id: "solar-system",
      title: "Solar System",
    },
    title: "How Strange Is Our Solar System?",
    teaser: "Five quick questions about the surprising worlds closest to home.",
    releaseAt: "2026-08-31T00:00:00.000Z",
    questions: [
      {
        id: "jupiter-shortest-day",
        prompt: "Which planet has the shortest day in the solar system?",
        options: [
          { id: "mars", label: "Mars" },
          { id: "jupiter", label: "Jupiter" },
          { id: "mercury", label: "Mercury" },
          { id: "neptune", label: "Neptune" },
        ],
        correctOptionId: "jupiter",
        reveal: {
          explanation:
            "Jupiter is enormous, but it spins incredibly fast. One day there takes only about 9.9 Earth hours, making it the shortest planetary day in our solar system.",
          sourceLabel: "NASA Jupiter Facts",
          sourceUrl: "https://science.nasa.gov/jupiter/jupiter-facts/",
        },
      },
      {
        id: "venus-long-day",
        prompt: "On which planet is a day longer than a year?",
        options: [
          { id: "venus", label: "Venus" },
          { id: "saturn", label: "Saturn" },
          { id: "uranus", label: "Uranus" },
          { id: "earth", label: "Earth" },
        ],
        correctOptionId: "venus",
        reveal: {
          explanation:
            "Venus rotates so slowly that one spin takes 243 Earth days. Its trip around the Sun takes about 225 Earth days, so a Venus day is longer than a Venus year.",
          sourceLabel: "NASA Venus Facts",
          sourceUrl: "https://science.nasa.gov/venus/venus-facts/",
        },
      },
      {
        id: "uranus-tilt",
        prompt: "Which planet is tilted so far that it almost rolls around the Sun on its side?",
        options: [
          { id: "saturn", label: "Saturn" },
          { id: "uranus", label: "Uranus" },
          { id: "mars", label: "Mars" },
          { id: "jupiter", label: "Jupiter" },
        ],
        correctOptionId: "uranus",
        reveal: {
          explanation:
            "Uranus is tilted by about 98 degrees compared with its orbit. Scientists think a huge collision early in its history may have knocked it sideways.",
          sourceLabel: "NASA Gravity Assist",
          sourceUrl:
            "https://www.nasa.gov/podcasts/gravity-assist/gravity-assist-ice-giants-uranus-neptune-with-amy-simon/",
        },
      },
      {
        id: "olympus-mons-world",
        prompt: "Where is Olympus Mons, the tallest volcano in the solar system?",
        options: [
          { id: "mars", label: "Mars" },
          { id: "earth", label: "Earth" },
          { id: "venus", label: "Venus" },
          { id: "io", label: "Io" },
        ],
        correctOptionId: "mars",
        reveal: {
          explanation:
            "Olympus Mons is on Mars, and it is vast. NASA describes it as rising about 17 miles, or 27 kilometers, above the surrounding landscape.",
          sourceLabel: "NASA Mars Odyssey",
          sourceUrl:
            "https://www.nasa.gov/missions/odyssey/nasas-mars-odyssey-captures-huge-volcano-nears-100000-orbits/",
        },
      },
      {
        id: "saturn-density",
        prompt: "Which planet is so low-density that it would float in water, if you had a big enough tub?",
        options: [
          { id: "neptune", label: "Neptune" },
          { id: "saturn", label: "Saturn" },
          { id: "jupiter", label: "Jupiter" },
          { id: "mercury", label: "Mercury" },
        ],
        correctOptionId: "saturn",
        reveal: {
          explanation:
            "Saturn is the least dense planet in the solar system. NASA notes that it is the only planet with an average density lower than water, so the famous floating idea is directionally true.",
          sourceLabel: "NASA Cassini FAQ",
          sourceUrl: "https://science.nasa.gov/mission/cassini/faq/",
        },
      },
    ],
  },
] as const satisfies Drop[];

export type DropId = (typeof drops)[number]["id"];
export type QuestionId = (typeof drops)[number]["questions"][number]["id"];

export function getLiveDrop(now = new Date()) {
  return drops
    .filter((drop) => new Date(drop.releaseAt).getTime() <= now.getTime())
    .slice()
    .sort(
      (a, b) =>
        new Date(b.releaseAt).getTime() - new Date(a.releaseAt).getTime(),
    )[0];
}

export function isDropLive(drop: Drop, now = new Date()) {
  return new Date(drop.releaseAt).getTime() <= now.getTime();
}

export function getDropById(dropId: string) {
  return drops.find((drop) => drop.id === dropId) ?? null;
}

export function getQuestionById(drop: Drop, questionId: string) {
  return drop.questions.find((question) => question.id === questionId) ?? null;
}

export function toPublicDrop(drop: Drop) {
  return {
    id: drop.id,
    topic: drop.topic,
    area: drop.area,
    title: drop.title,
    teaser: drop.teaser,
    questionCount: drop.questions.length,
  };
}

export function toPublicQuestion(question: Question) {
  return {
    id: question.id,
    prompt: question.prompt,
    options: question.options,
  };
}
