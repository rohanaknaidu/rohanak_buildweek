import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  players: defineTable({
    playerId: v.string(),
    displayName: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_playerId", ["playerId"]),

  profiles: defineTable({
    authUserId: v.id("users"),
    email: v.optional(v.string()),
    displayName: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_authUserId", ["authUserId"]),

  attempts: defineTable({
    playerId: v.string(),
    profileId: v.optional(v.id("profiles")),
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
  })
    .index("by_playerId_dropId", ["playerId", "dropId"])
    .index("by_profileId_dropId", ["profileId", "dropId"]),

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
    inviterProfileId: v.optional(v.id("profiles")),
    inviterPlayerId: v.optional(v.string()),
    dropId: v.string(),
    createdAt: v.number(),
  })
    .index("by_inviter_profile_drop", ["inviterProfileId", "dropId"])
    .index("by_inviter_player_drop", ["inviterPlayerId", "dropId"]),

  knowledgePairs: defineTable({
    profileAId: v.id("profiles"),
    profileBId: v.id("profiles"),
    pairKey: v.string(),
    createdFromInviteId: v.id("invites"),
    createdAt: v.number(),
  })
    .index("by_pairKey", ["pairKey"])
    .index("by_profileA", ["profileAId"])
    .index("by_profileB", ["profileBId"]),
});
