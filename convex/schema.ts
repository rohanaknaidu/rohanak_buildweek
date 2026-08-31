import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  players: defineTable({
    playerId: v.string(),
    displayName: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
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
    sourceInviteId: v.optional(v.id("invites")),
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

  invites: defineTable({
    inviterPlayerId: v.string(),
    dropId: v.string(),
    createdAt: v.number(),
  }).index("by_inviter_drop", ["inviterPlayerId", "dropId"]),
});
