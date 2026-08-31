import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  getDropById,
  getLiveDrop,
  getQuestionById,
  toPublicDrop,
  toPublicQuestion,
} from "../content/drops";

type AnswerDoc = Doc<"answers">;

async function getPlayerByLocalId(ctx: QueryCtx | MutationCtx, playerId: string) {
  return await ctx.db
    .query("players")
    .withIndex("by_playerId", (q) => q.eq("playerId", playerId))
    .unique();
}

async function getAttempt(
  ctx: QueryCtx | MutationCtx,
  playerId: string,
  dropId: string,
) {
  return await ctx.db
    .query("attempts")
    .withIndex("by_playerId_dropId", (q) =>
      q.eq("playerId", playerId).eq("dropId", dropId),
    )
    .unique();
}

async function getAnswers(ctx: QueryCtx | MutationCtx, attemptId: Id<"attempts">) {
  return await ctx.db
    .query("answers")
    .withIndex("by_attempt", (q) => q.eq("attemptId", attemptId))
    .collect();
}

function getScore(answers: AnswerDoc[]) {
  return answers.filter((answer) => answer.correct).length;
}

function makeRevealPayload(answer: AnswerDoc) {
  const drop = getDropById(answer.dropId);
  if (!drop) {
    throw new Error("Drop not found for answer.");
  }

  const question = getQuestionById(drop, answer.questionId);
  if (!question) {
    throw new Error("Question not found for answer.");
  }

  return {
    questionId: question.id,
    selectedOptionId: answer.selectedOptionId,
    correctOptionId: question.correctOptionId,
    correct: answer.correct,
    explanation: question.reveal.explanation,
    source: {
      label: question.reveal.sourceLabel,
      url: question.reveal.sourceUrl,
    },
  };
}

function getAttemptPayload(attempt: Doc<"attempts">, answers: AnswerDoc[]) {
  const drop = getDropById(attempt.dropId);
  if (!drop) {
    throw new Error("Drop not found for attempt.");
  }

  const currentQuestion = drop.questions[attempt.currentQuestionIndex] ?? null;
  const currentAnswer =
    currentQuestion === null
      ? null
      : (answers.find((answer) => answer.questionId === currentQuestion.id) ??
        null);

  return {
    attempt: {
      stage: attempt.stage,
      currentQuestionIndex: attempt.currentQuestionIndex,
      completedAt: attempt.completedAt,
      resultViewedAt: attempt.resultViewedAt,
    },
    currentQuestion: currentQuestion ? toPublicQuestion(currentQuestion) : null,
    reveal: currentAnswer ? makeRevealPayload(currentAnswer) : null,
    result:
      attempt.stage === "result"
        ? {
            score: getScore(answers),
            total: drop.questions.length,
          }
        : null,
  };
}

export const getHome = query({
  args: {},
  handler: () => {
    const drop = getLiveDrop();

    if (!drop) {
      return { drop: null };
    }

    return {
      drop: toPublicDrop(drop),
    };
  },
});

export const getFlowState = query({
  args: {
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const drop = getLiveDrop();

    if (!drop) {
      return { drop: null, player: null, attemptState: null };
    }

    const player = await getPlayerByLocalId(ctx, args.playerId);
    const attempt = await getAttempt(ctx, args.playerId, drop.id);

    if (!attempt) {
      return {
        drop: toPublicDrop(drop),
        player: player ? { playerId: player.playerId } : null,
        attemptState: null,
      };
    }

    const answers = await getAnswers(ctx, attempt._id);

    return {
      drop: toPublicDrop(drop),
      player: player ? { playerId: player.playerId } : null,
      attemptState: getAttemptPayload(attempt, answers),
    };
  },
});

export const startAttempt = mutation({
  args: {
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const drop = getLiveDrop();

    if (!drop) {
      throw new Error("No live Drop is available.");
    }

    const now = Date.now();
    const existingPlayer = await getPlayerByLocalId(ctx, args.playerId);

    if (!existingPlayer) {
      await ctx.db.insert("players", {
        playerId: args.playerId,
        createdAt: now,
      });
    }

    const existingAttempt = await getAttempt(ctx, args.playerId, drop.id);

    if (existingAttempt) {
      const answers = await getAnswers(ctx, existingAttempt._id);
      return {
        drop: toPublicDrop(drop),
        attemptState: getAttemptPayload(existingAttempt, answers),
      };
    }

    const attemptId = await ctx.db.insert("attempts", {
      playerId: args.playerId,
      dropId: drop.id,
      currentQuestionIndex: 0,
      stage: "answering",
      startedAt: now,
    });

    const attempt = await ctx.db.get(attemptId);

    if (!attempt) {
      throw new Error("Attempt could not be started.");
    }

    return {
      drop: toPublicDrop(drop),
      attemptState: getAttemptPayload(attempt, []),
    };
  },
});

export const submitAnswer = mutation({
  args: {
    playerId: v.string(),
    questionId: v.string(),
    selectedOptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const drop = getLiveDrop();

    if (!drop) {
      throw new Error("No live Drop is available.");
    }

    const attempt = await getAttempt(ctx, args.playerId, drop.id);

    if (!attempt) {
      throw new Error("Start the Drop before answering.");
    }

    if (attempt.stage === "result") {
      throw new Error("This Attempt is already complete.");
    }

    const question = drop.questions[attempt.currentQuestionIndex];

    if (!question || question.id !== args.questionId) {
      throw new Error("This Question is not currently answerable.");
    }

    const selectedOption = question.options.find(
      (option) => option.id === args.selectedOptionId,
    );

    if (!selectedOption) {
      throw new Error("Selected option does not exist for this Question.");
    }

    const existingAnswer = await ctx.db
      .query("answers")
      .withIndex("by_attempt_question", (q) =>
        q.eq("attemptId", attempt._id).eq("questionId", question.id),
      )
      .unique();

    if (existingAnswer) {
      const answers = await getAnswers(ctx, attempt._id);
      return {
        drop: toPublicDrop(drop),
        attemptState: getAttemptPayload(attempt, answers),
      };
    }

    await ctx.db.insert("answers", {
      attemptId: attempt._id,
      playerId: args.playerId,
      dropId: drop.id,
      questionId: question.id,
      selectedOptionId: selectedOption.id,
      correct: selectedOption.id === question.correctOptionId,
      answeredAt: Date.now(),
    });

    await ctx.db.patch(attempt._id, {
      stage: "revealing",
      completedAt:
        attempt.currentQuestionIndex === drop.questions.length - 1
          ? Date.now()
          : attempt.completedAt,
    });

    const updatedAttempt = await ctx.db.get(attempt._id);
    const answers = await getAnswers(ctx, attempt._id);

    if (!updatedAttempt) {
      throw new Error("Attempt not found after answer.");
    }

    return {
      drop: toPublicDrop(drop),
      attemptState: getAttemptPayload(updatedAttempt, answers),
    };
  },
});

export const continueAfterReveal = mutation({
  args: {
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const drop = getLiveDrop();

    if (!drop) {
      throw new Error("No live Drop is available.");
    }

    const attempt = await getAttempt(ctx, args.playerId, drop.id);

    if (!attempt) {
      throw new Error("Start the Drop first.");
    }

    const answers = await getAnswers(ctx, attempt._id);
    const question = drop.questions[attempt.currentQuestionIndex];
    const answerForCurrentQuestion = question
      ? answers.find((answer) => answer.questionId === question.id)
      : null;

    if (!answerForCurrentQuestion) {
      throw new Error("Answer the current Question before continuing.");
    }

    const nextQuestionIndex = attempt.currentQuestionIndex + 1;

    if (nextQuestionIndex >= drop.questions.length) {
      await ctx.db.patch(attempt._id, {
        stage: "result",
        resultViewedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(attempt._id, {
        stage: "answering",
        currentQuestionIndex: nextQuestionIndex,
      });
    }

    const updatedAttempt = await ctx.db.get(attempt._id);

    if (!updatedAttempt) {
      throw new Error("Attempt not found after continuing.");
    }

    return {
      drop: toPublicDrop(drop),
      attemptState: getAttemptPayload(updatedAttempt, answers),
    };
  },
});
