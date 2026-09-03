import type { DropContent } from "../registry";

export const mindAttentionMissed001 = {
  id: "mind-attention-missed-001",
  topicId: "mind",
  areaId: "attention",
  title: "How Can You Miss Something Right in Front of You?",
  description:
    "A quick challenge about attention, missed events, scene changes, and mental limits.",
  status: "live",
  releaseAt: "2026-09-06T18:30:00.000Z",
  releaseOrder: 7,
  experience: {
    centralIdea:
      "Attention is selective; visible information can fail to become noticed when the mind is committed elsewhere.",
    exitUnderstanding:
      "You do not experience everything your eyes receive. Attention decides which parts of the world become available to awareness and memory.",
    visualIdentity: {
      family: "cognitive",
      motif: "neural-field",
      artwork: {
        hero: "mind-attention-field",
        reveal: "mind-attention-field",
      },
    },
  },
  questions: [
    {
      id: "counting-misses-gorilla",
      prompt:
        "In a famous attention experiment, people counted basketball passes. What did many of them miss?",
      options: [
        { id: "tiny-logo", label: "A tiny logo changing in the corner" },
        { id: "unexpected-person", label: "An unexpected person walking through the scene" },
        { id: "all-motion", label: "All movement in the video" },
        { id: "ball-color-only", label: "Only the color of the ball" },
      ],
      correctOptionId: "unexpected-person",
      reveal: {
        discovery: "You can miss something visible when attention is elsewhere.",
        explanation:
          "In the classic inattentional blindness study, many participants focused on counting passes did not notice an unexpected person in a gorilla suit crossing the scene.",
        source: {
          label: "PubMed Gorillas in Our Midst",
          url: "https://pubmed.ncbi.nlm.nih.gov/10694957/",
        },
      },
    },
    {
      id: "change-blindness",
      prompt:
        "What can happen when a scene changes during a brief visual interruption?",
      options: [
        { id: "always-notice", label: "People almost always notice the change" },
        { id: "miss-large-change", label: "People can miss even large changes" },
        { id: "memory-perfect", label: "Memory for the scene becomes more accurate" },
        { id: "only-colors", label: "Only colors can change unnoticed" },
      ],
      correctOptionId: "miss-large-change",
      reveal: {
        discovery: "People can miss surprisingly large changes between scenes.",
        explanation:
          "Change blindness shows that people can fail to notice substantial visual changes when attention is not directed to the changing feature.",
        source: {
          label: "PubMed Change Blindness Review",
          url: "https://pubmed.ncbi.nlm.nih.gov/10740279/",
        },
      },
    },
    {
      id: "looking-not-attending",
      prompt:
        "If your eyes are pointed near an object, what is still not guaranteed?",
      options: [
        { id: "light-retina", label: "That light from the scene reaches the retina" },
        { id: "attention-object", label: "That your attention is on that object" },
        { id: "object-exists", label: "That the object exists outside your eye" },
      ],
      correctOptionId: "attention-object",
      reveal: {
        discovery: "Looking and attending are not the same thing.",
        explanation:
          "Eye direction and attention often work together, but they are not identical. You can look toward a scene while attention is focused on only part of it.",
        source: {
          label: "Noba Attention",
          url: "https://nobaproject.com/modules/attention",
        },
      },
    },
    {
      id: "dual-task-attention",
      prompt:
        "Why can solving a demanding problem make you worse at noticing something else?",
      options: [
        { id: "attention-competes", label: "Demanding tasks compete for limited attention" },
        { id: "attention-unlimited", label: "Attention is unlimited, so it should not matter" },
        { id: "tasks-take-turns", label: "The mind automatically gives each task equal turns" },
        { id: "familiar-no-attention", label: "Familiar tasks stop using attention entirely" },
      ],
      correctOptionId: "attention-competes",
      reveal: {
        discovery: "Two demanding tasks can compete for the same mental resources.",
        explanation:
          "Attention is limited. When a demanding task consumes attention, fewer resources may remain for noticing and processing other information.",
        source: {
          label: "Noba Attention",
          url: "https://nobaproject.com/modules/attention",
        },
      },
    },
  ],
} as const satisfies DropContent;
