import type { DropContent } from "../registry";

export const mindConfidenceWrong001 = {
  id: "mind-confidence-wrong-001",
  topicId: "mind",
  areaId: "confidence",
  title: "Why Can You Feel Certain and Still Be Wrong?",
  description:
    "A quick challenge about confidence, feedback, repetition, fluency, and memory certainty.",
  status: "live",
  releaseAt: "2026-09-08T18:30:00.000Z",
  releaseOrder: 9,
  experience: {
    centralIdea:
      "Confidence is a mental judgment that can be shaped by accuracy, feedback, familiarity, and processing ease.",
    exitUnderstanding:
      "Feeling certain can be useful, but it is not proof. Confidence can be influenced after the original experience.",
    visualIdentity: {
      family: "cognitive",
      motif: "memory-trace",
      artwork: {
        hero: "mind-confidence-trace",
        reveal: "mind-confidence-trace",
      },
    },
  },
  questions: [
    {
      id: "feedback-inflates-confidence",
      prompt:
        "After someone picks a face from a lineup, what can hearing 'Good, you picked the suspect' do?",
      options: [
        { id: "increase-confidence", label: "Increase their confidence in the choice" },
        { id: "prove-accuracy", label: "Prove the choice was accurate" },
        { id: "only-speed", label: "Change only how fast they answer next time" },
      ],
      correctOptionId: "increase-confidence",
      reveal: {
        discovery: "Feedback after a choice can make someone more confident.",
        explanation:
          "Post-identification feedback can inflate eyewitness confidence. That is why confidence gathered after confirming feedback can be less informative than confidence recorded earlier.",
        source: {
          label: "PubMed Post-Identification Feedback",
          url: "https://pubmed.ncbi.nlm.nih.gov/22667810/",
        },
      },
    },
    {
      id: "confidence-not-proof",
      prompt:
        "If someone feels very confident about a memory, what does that prove?",
      options: [
        { id: "always-accurate", label: "The memory is always accurate" },
        { id: "may-still-be-wrong", label: "The memory may still be wrong" },
        { id: "video-recorded", label: "The event was stored like a video" },
      ],
      correctOptionId: "may-still-be-wrong",
      reveal: {
        discovery: "Feeling certain is not the same as being right.",
        explanation:
          "Confidence and accuracy can be related, but confidence is not a guarantee. Memory confidence can be affected by later feedback, suggestion, and the conditions under which the memory was formed.",
        source: {
          label: "National Academies Eyewitness Report",
          url: "https://nap.nationalacademies.org/catalog/18891/identifying-the-culprit-assessing-eyewitness-identification",
        },
      },
    },
    {
      id: "initial-confidence-cleaner",
      prompt:
        "Which confidence report is usually less affected by later outside influence?",
      options: [
        { id: "before-feedback", label: "Confidence recorded before feedback or discussion" },
        { id: "after-praise", label: "Confidence after being praised" },
        { id: "after-discussion", label: "Confidence after discussing it with others" },
      ],
      correctOptionId: "before-feedback",
      reveal: {
        discovery: "Early confidence can be more informative than confidence after outside influence.",
        explanation:
          "The National Academies report emphasizes recording eyewitness confidence at the time of identification because later events can contaminate confidence reports.",
        source: {
          label: "National Academies Eyewitness Report",
          url: "https://nap.nationalacademies.org/catalog/18891/identifying-the-culprit-assessing-eyewitness-identification",
        },
      },
    },
    {
      id: "repetition-feels-true",
      prompt:
        "What can repeated exposure to a claim make that claim feel like?",
      options: [
        { id: "more-true", label: "More true" },
        { id: "familiar-only", label: "Only more familiar, never more believable" },
        { id: "suspicious", label: "Less believable because repetition is always noticed" },
      ],
      correctOptionId: "more-true",
      reveal: {
        discovery: "Repeated information can feel true even when it is not.",
        explanation:
          "The illusory truth effect describes how repeated statements can be judged as more true than new statements. Repetition is not evidence, but it can influence the feeling of truth.",
        source: {
          label: "PubMed Illusory Truth Review",
          url: "https://pubmed.ncbi.nlm.nih.gov/38113667/",
        },
      },
    },
    {
      id: "fluency-feels-believable",
      prompt:
        "When evidence is the same, which claim can feel more believable?",
      options: [
        { id: "easy-process", label: "The claim that is easier to read or process" },
        { id: "hard-process", label: "The claim that takes more effort to process" },
        { id: "newer", label: "The claim that feels newest" },
      ],
      correctOptionId: "easy-process",
      reveal: {
        discovery: "Easy-to-process information can feel more believable.",
        explanation:
          "Processing fluency can act as a cue in truth judgments. A claim that feels easier to process may feel more believable, even though fluency itself does not prove that the claim is true.",
        source: {
          label: "PubMed Fluency and Truth",
          url: "https://pubmed.ncbi.nlm.nih.gov/22558063/",
        },
      },
    },
  ],
} as const satisfies DropContent;
