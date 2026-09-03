import { areas } from "./areas";
import { bodySpaceSleep001 } from "./drops/body-space-sleep-001";
import { bodySpaceVision001 } from "./drops/body-space-vision-001";
import { bodySpaceflightChanges001 } from "./drops/body-spaceflight-changes-001";
import { physicsGravityStrange001 } from "./drops/physics-gravity-strange-001";
import { spaceSolarSystemStrange001 } from "./drops/space-solar-system-strange-001";
import { trails } from "./trails";
import { topics } from "./topics";

export type DropStatus = "draft" | "live";

export type VisualFamily = string;

export type VisualMotif = string;

const supportedVisualFamilies = ["cosmic", "gravitational", "organic"] as const;
const supportedVisualMotifs = [
  "orbit",
  "falling-arc",
  "microgravity-body",
] as const;
const supportedArtworkIds = [
  "solar-system-orbits",
  "planetary-surprise",
  "gravity-freefall",
  "orbital-fall",
  "body-in-microgravity",
  "fluid-shift",
] as const;

export type VisualIdentity = {
  family: VisualFamily;
  motif: VisualMotif;
  artwork?: {
    hero?: string;
    reveal?: string;
  };
};

export type DropExperience = {
  centralIdea: string;
  exitUnderstanding: string;
  visualIdentity: VisualIdentity;
};

export type Source = {
  label: string;
  url: string;
};

export type Reveal = {
  discovery: string;
  explanation: string;
  source: Source;
};

export type Question = {
  id: string;
  prompt: string;
  options: AnswerOption[];
  correctOptionId: string;
  reveal: Reveal;
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
  releaseAt: string;
  releaseOrder: number;
  experience: DropExperience;
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

export type Trail = {
  id: string;
  title: string;
  description: string;
  dropIds: string[];
  bridges: string[];
};

export type TrailContext = {
  trail: Trail;
  position: number;
  total: number;
  previousDrop: Drop | null;
  nextDrop: Drop | null;
};

const dropContent = [
  spaceSolarSystemStrange001,
  physicsGravityStrange001,
  bodySpaceflightChanges001,
  bodySpaceSleep001,
  bodySpaceVision001,
] as const satisfies DropContent[];

export const drops = dropContent.map(resolveDrop);

export type DropId = (typeof dropContent)[number]["id"];
export type QuestionId = (typeof dropContent)[number]["questions"][number]["id"];

export function getDrop(dropId: string) {
  return drops.find((drop) => drop.id === dropId) ?? null;
}

export function isDropReleased(drop: Drop, now: number) {
  return drop.status === "live" && Date.parse(drop.releaseAt) <= now;
}

export function isDropUpcoming(drop: Drop, now: number) {
  return drop.status === "live" && Date.parse(drop.releaseAt) > now;
}

export function getReleasedDrops(now: number) {
  return drops.filter((drop) => isDropReleased(drop, now));
}

export function getUpcomingDrops(now: number) {
  return drops
    .filter((drop) => isDropUpcoming(drop, now))
    .sort((a, b) => Date.parse(a.releaseAt) - Date.parse(b.releaseAt));
}

export function getNextUpcomingDrop(now: number) {
  return getUpcomingDrops(now)[0] ?? null;
}

export function getDropsForTopic(topicId: string) {
  return drops.filter((drop) => drop.topicId === topicId);
}

export function getTrails() {
  return trails.map(resolveTrail);
}

export function getTrailContextForDrop(dropId: string, now = Date.now()) {
  for (const trail of getTrails()) {
    const index = trail.dropIds.indexOf(dropId);

    if (index === -1) {
      continue;
    }

    return {
      trail,
      position: index + 1,
      total: trail.dropIds.length,
      previousDrop: getReleasedTrailNeighbor(trail.dropIds, index, -1, now),
      nextDrop: getReleasedTrailNeighbor(trail.dropIds, index, 1, now),
    };
  }

  return null;
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
    releaseAt: drop.releaseAt,
    experience: drop.experience,
    questionCount: drop.questions.length,
  };
}

export function toPublicTrail(trail: Trail) {
  return {
    id: trail.id,
    title: trail.title,
    description: trail.description,
    bridges: trail.bridges,
  };
}

export function toPublicTrailContext(context: TrailContext | null) {
  if (!context) {
    return null;
  }

  return {
    trail: toPublicTrail(context.trail),
    position: context.position,
    total: context.total,
    previousDrop: context.previousDrop ? toPublicDrop(context.previousDrop) : null,
    nextDrop: context.nextDrop ? toPublicDrop(context.nextDrop) : null,
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
  validateVisualIdentity(drop);
  validateReleaseAt(drop);
  validateDiscoveries(drop);

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

function validateReleaseAt(drop: DropContent) {
  if (Number.isNaN(Date.parse(drop.releaseAt))) {
    throw new Error(`Drop "${drop.id}" has invalid releaseAt "${drop.releaseAt}".`);
  }
}

function validateDiscoveries(drop: DropContent) {
  for (const question of drop.questions) {
    if (!question.reveal.discovery.trim()) {
      throw new Error(
        `Drop "${drop.id}" question "${question.id}" is missing a discovery sentence.`,
      );
    }
  }
}

function validateVisualIdentity(drop: DropContent) {
  if (
    !(supportedVisualFamilies as readonly string[]).includes(
      drop.experience.visualIdentity.family,
    )
  ) {
    throw new Error(
      `Drop "${drop.id}" references unsupported visual family "${drop.experience.visualIdentity.family}".`,
    );
  }

  if (
    !(supportedVisualMotifs as readonly string[]).includes(
      drop.experience.visualIdentity.motif,
    )
  ) {
    throw new Error(
      `Drop "${drop.id}" references unsupported visual motif "${drop.experience.visualIdentity.motif}".`,
    );
  }

  for (const artworkId of Object.values(
    drop.experience.visualIdentity.artwork ?? {},
  )) {
    if (
      artworkId &&
      !(supportedArtworkIds as readonly string[]).includes(artworkId)
    ) {
      throw new Error(
        `Drop "${drop.id}" references unsupported artwork "${artworkId}".`,
      );
    }
  }
}

function resolveTrail(trail: Trail): Trail {
  if (trail.bridges.length !== Math.max(trail.dropIds.length - 1, 0)) {
    throw new Error(
      `Trail "${trail.id}" must include one bridge for each Drop transition.`,
    );
  }

  for (const dropId of trail.dropIds) {
    const drop = getDrop(dropId);

    if (!drop) {
      throw new Error(`Trail "${trail.id}" references missing Drop "${dropId}".`);
    }
  }

  return trail;
}

function getReleasedTrailNeighbor(
  dropIds: readonly string[],
  currentIndex: number,
  direction: -1 | 1,
  now: number,
) {
  const drop = getDrop(dropIds[currentIndex + direction]);

  return drop && isDropReleased(drop, now) ? drop : null;
}
