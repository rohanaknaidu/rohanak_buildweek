import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  players: defineTable({
    playerId: v.string(),
    createdAt: v.number(),
  }).index("by_playerId", ["playerId"]),

  attempts: defineTable({
    playerId: v.string(),
    dropId: v.string(),
    currentQuestionIndex: v.number(),
    stage: v.union(
      v.literal("answering"),
      v.literal("revealing"),
      v.literal("result"),
    ),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    resultViewedAt: v.optional(v.number()),
  }).index("by_playerId_dropId", ["playerId", "dropId"]),

  answers: defineTable({
    attemptId: v.id("attempts"),
    playerId: v.string(),
    dropId: v.string(),
    questionId: v.string(),
    selectedOptionId: v.string(),
    correct: v.boolean(),
    answeredAt: v.number(),
  })
    .index("by_attempt", ["attemptId"])
    .index("by_attempt_question", ["attemptId", "questionId"]),
});
