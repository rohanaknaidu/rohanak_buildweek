import { areas } from "./areas";
import { spaceSolarSystemStrange001 } from "./drops/space-solar-system-strange-001";
import { topics } from "./topics";

export type DropStatus = "draft" | "live";

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

export type DropContent = {
  id: string;
  topicId: string;
  areaId: string;
  title: string;
  description: string;
  status: DropStatus;
  releaseOrder: number;
  questions: Question[];
};

export type Drop = DropContent & {
  topic: {
    id: string;
    name: string;
    description: string;
  };
  area: {
    id: string;
    topicId: string;
    name: string;
  };
};

const dropContent = [spaceSolarSystemStrange001] as const satisfies DropContent[];

export const drops = dropContent.map(resolveDrop);

export type DropId = (typeof dropContent)[number]["id"];
export type QuestionId = (typeof dropContent)[number]["questions"][number]["id"];

export function getDrop(dropId: string) {
  return drops.find((drop) => drop.id === dropId) ?? null;
}

export function getLiveDrops() {
  return drops.filter((drop) => drop.status === "live");
}

export function getDropsForTopic(topicId: string) {
  return drops.filter((drop) => drop.topicId === topicId);
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
    description: drop.description,
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

function resolveDrop(drop: DropContent): Drop {
  const topic = topics.find((candidate) => candidate.id === drop.topicId);
  const area = areas.find((candidate) => candidate.id === drop.areaId);

  if (!topic) {
    throw new Error(`Drop "${drop.id}" references missing Topic "${drop.topicId}".`);
  }

  if (!area) {
    throw new Error(`Drop "${drop.id}" references missing Area "${drop.areaId}".`);
  }

  if (area.topicId !== topic.id) {
    throw new Error(
      `Drop "${drop.id}" references Area "${area.id}" outside Topic "${topic.id}".`,
    );
  }

  return {
    ...drop,
    topic,
    area,
  };
}
