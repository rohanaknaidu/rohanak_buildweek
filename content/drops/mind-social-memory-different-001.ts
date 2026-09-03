import type { DropContent } from "../registry";

export const mindSocialMemoryDifferent001 = {
  id: "mind-social-memory-different-001",
  topicId: "mind",
  areaId: "social-memory",
  title: "Can Two People Remember the Same Event Differently?",
  description:
    "A quick challenge about shared events, misinformation, memory conformity, source confusion, and group recall.",
  status: "live",
  releaseAt: "2026-09-09T18:30:00.000Z",
  releaseOrder: 10,
  experience: {
    centralIdea:
      "Memory can become social; what people attend to, hear afterward, and retell together can shape what each person remembers.",
    exitUnderstanding:
      "Two sincere people can share an event and still carry away different memories because attention and memory are reconstructed socially as well as individually.",
    visualIdentity: {
      family: "cognitive",
      motif: "memory-trace",
      artwork: {
        hero: "mind-social-memory",
        reveal: "mind-social-memory",
      },
    },
  },
  questions: [
    {
      id: "different-attention-same-event",
      prompt:
        "Why might two people remember different details from the same event?",
      options: [
        { id: "different-attention", label: "They attended to different parts of it" },
        { id: "one-worse-memory", label: "One person must simply have a worse memory" },
        { id: "one-version", label: "Events can create only one remembered version" },
        { id: "attention-irrelevant", label: "Memory ignores attention" },
      ],
      correctOptionId: "different-attention",
      reveal: {
        discovery: "Two people can encode different parts of the same event.",
        explanation:
          "Memory begins with what was attended to and encoded. Two people at the same event can focus on different details, so later they may sincerely remember different parts.",
        source: {
          label: "NCBI Eyewitness Identification",
          url: "https://www.ncbi.nlm.nih.gov/books/NBK621592/",
        },
      },
    },
    {
      id: "misinformation-after-event",
      prompt:
        "What can later misleading details do to someone's memory report?",
      options: [
        { id: "influence-report", label: "Influence what they later report remembering" },
        { id: "immune", label: "Make the original memory immune to error" },
        { id: "confidence-only", label: "Affect confidence but never remembered details" },
      ],
      correctOptionId: "influence-report",
      reveal: {
        discovery: "New information after an event can change what someone remembers.",
        explanation:
          "Misinformation research shows that misleading post-event information can influence later memory reports. People may incorporate details encountered after the event.",
        source: {
          label: "PubMed Misinformation Review",
          url: "https://pubmed.ncbi.nlm.nih.gov/38696106/",
        },
      },
    },
    {
      id: "memory-conformity",
      prompt:
        "After hearing another person's version of an event, what can happen to your own account?",
      options: [
        { id: "shift-toward", label: "It can shift toward their version" },
        { id: "become-fixed", label: "It becomes impossible to change" },
        { id: "separate-always", label: "It always stays separate from their version" },
        { id: "confidence-only", label: "Only your confidence changes, never your account" },
      ],
      correctOptionId: "shift-toward",
      reveal: {
        discovery: "Another person's account can influence what you remember.",
        explanation:
          "Memory conformity occurs when one person's report influences another person's memory report. Social information can become part of how an event is later described.",
        source: {
          label: "PubMed Memory Conformity Review",
          url: "https://pubmed.ncbi.nlm.nih.gov/26343535/",
        },
      },
    },
    {
      id: "social-source-confusion",
      prompt:
        "After hearing a detail from someone else, what might you later forget?",
      options: [
        { id: "they-supplied", label: "That they supplied the detail" },
        { id: "detail-importance", label: "Whether the detail seemed important" },
        { id: "detail-order", label: "The order in which details happened" },
      ],
      correctOptionId: "they-supplied",
      reveal: {
        discovery: "You can remember a detail without remembering that someone else supplied it.",
        explanation:
          "Source-monitoring errors can happen socially. A person may remember a detail but forget whether it came from their own experience, a suggestion, or another person's account.",
        source: {
          label: "NCBI Eyewitness Identification",
          url: "https://www.ncbi.nlm.nih.gov/books/NBK621592/",
        },
      },
    },
    {
      id: "collaborative-inhibition",
      prompt:
        "When a group tries to remember together, what can sometimes happen compared with each person remembering alone and pooling answers afterward?",
      options: [
        { id: "less-total", label: "The group recalls less total information" },
        { id: "more-total", label: "The group always recalls more because everyone adds cues" },
        { id: "same-pooled", label: "The group recalls exactly the same as pooled individual recall" },
      ],
      correctOptionId: "less-total",
      reveal: {
        discovery: "Groups can sometimes recall less together than their members recall separately.",
        explanation:
          "Collaborative inhibition describes a counterintuitive finding: groups can recall less together than the combined non-overlapping recall of the same number of individuals working separately.",
        source: {
          label: "PubMed Collaborative Inhibition",
          url: "https://pubmed.ncbi.nlm.nih.gov/11920700/",
        },
      },
    },
  ],
} as const satisfies DropContent;
