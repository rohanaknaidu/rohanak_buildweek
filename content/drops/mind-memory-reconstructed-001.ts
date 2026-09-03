import type { DropContent } from "../registry";

export const mindMemoryReconstructed001 = {
  id: "mind-memory-reconstructed-001",
  topicId: "mind",
  areaId: "memory",
  title: "Can Remembering Change a Memory?",
  description:
    "A quick challenge about reconstruction, false memories, later details, source confusion, and retelling.",
  status: "live",
  releaseAt: "2026-09-07T18:30:00.000Z",
  releaseOrder: 8,
  experience: {
    centralIdea:
      "Memory is reconstructed from stored traces, meaning, later information, and retelling rather than replayed perfectly.",
    exitUnderstanding:
      "Remembering can preserve real experience while also reshaping details, sources, and confidence.",
    visualIdentity: {
      family: "cognitive",
      motif: "memory-trace",
      artwork: {
        hero: "mind-memory-trace",
        reveal: "mind-memory-trace",
      },
    },
  },
  questions: [
    {
      id: "memory-rebuilds",
      prompt: "Memory is usually closer to which process?",
      options: [
        { id: "video-replay", label: "Replaying a stored video exactly" },
        { id: "rebuilding", label: "Rebuilding an event from stored pieces" },
        { id: "transcript", label: "Reading a word-for-word transcript" },
        { id: "download", label: "Downloading an unchanged file" },
      ],
      correctOptionId: "rebuilding",
      reveal: {
        discovery: "Memory rebuilds events rather than replaying them exactly.",
        explanation:
          "Memory is reconstructive. People often remember real events, but the act of remembering rebuilds details from stored information, meaning, and context rather than replaying a perfect recording.",
        source: {
          label: "APA Reconstructive Memory",
          url: "https://dictionary.apa.org/reconstructive-memory",
        },
      },
    },
    {
      id: "false-related-word",
      prompt:
        "In memory studies, people may hear words like bed, rest, awake, tired, and dream. What error can happen later?",
      options: [
        { id: "remember-theme-word", label: "They remember a related theme word that was never shown" },
        { id: "forget-language", label: "They forget which language the list used" },
        { id: "remember-random-object", label: "They remember an unrelated object more often than the theme" },
      ],
      correctOptionId: "remember-theme-word",
      reveal: {
        discovery: "People can remember a related idea that was never actually shown.",
        explanation:
          "In the Deese-Roediger-McDermott false-memory task, related word lists can make people falsely remember an associated lure word, such as sleep, even when it was not presented.",
        source: {
          label: "PubMed DRM False Memory Task",
          url: "https://pubmed.ncbi.nlm.nih.gov/28190038/",
        },
      },
    },
    {
      id: "post-event-information",
      prompt: "What can misleading information heard after an event do?",
      options: [
        { id: "no-effect", label: "Never affect later memory" },
        { id: "mix-in", label: "Mix into later memory reports" },
        { id: "erase-all", label: "Erase the entire memory instantly" },
        { id: "children-only", label: "Affect only children" },
      ],
      correctOptionId: "mix-in",
      reveal: {
        discovery: "Later information can become part of what someone remembers.",
        explanation:
          "The misinformation effect shows that information introduced after an event can influence later memory reports. The original experience and later details can become hard to separate.",
        source: {
          label: "PubMed Misinformation Review",
          url: "https://pubmed.ncbi.nlm.nih.gov/38696106/",
        },
      },
    },
    {
      id: "source-confusion",
      prompt: "What can someone forget even when they remember a detail?",
      options: [
        { id: "source", label: "Where the detail came from" },
        { id: "importance", label: "Whether the detail felt important" },
        { id: "emotion", label: "Whether the event had emotion" },
      ],
      correctOptionId: "source",
      reveal: {
        discovery: "People can remember information while forgetting its source.",
        explanation:
          "Source monitoring is the process of identifying where a memory came from. Errors can happen when someone remembers a detail but misattributes its source.",
        source: {
          label: "APA Source Monitoring",
          url: "https://dictionary.apa.org/source-monitoring",
        },
      },
    },
    {
      id: "retelling-reshapes",
      prompt: "What can repeated retelling do to a memory?",
      options: [
        { id: "exact-preserve", label: "Preserve every detail exactly" },
        { id: "cleaner-story", label: "Reshape it into a cleaner story" },
        { id: "stop-forgetting", label: "Stop forgetting forever" },
        { id: "emotion-only", label: "Change only emotion, never details" },
      ],
      correctOptionId: "cleaner-story",
      reveal: {
        discovery: "Retelling can reshape a memory into a cleaner story.",
        explanation:
          "Repeated reproduction studies show that retelling can transform remembered material. Details may be omitted, emphasized, or reorganized as the memory becomes a more coherent account.",
        source: {
          label: "APA Repeated Reproduction",
          url: "https://dictionary.apa.org/repeated-reproduction",
        },
      },
    },
    {
      id: "memory-reactivated-update",
      prompt:
        "Under some conditions, what can happen when a memory is reactivated?",
      options: [
        { id: "easier-update", label: "It may become easier to update" },
        { id: "frozen", label: "It becomes permanently frozen" },
        { id: "instant-delete", label: "It disappears instantly" },
        { id: "photographic", label: "It becomes photographic" },
      ],
      correctOptionId: "easier-update",
      reveal: {
        discovery: "Retrieving a memory can sometimes make it easier to update.",
        explanation:
          "Reconsolidation research suggests that reactivated memories can, under some conditions, become susceptible to updating before they stabilize again. This does not mean every memory is rewritten every time it is recalled.",
        source: {
          label: "PubMed Memory Reconsolidation Review",
          url: "https://pubmed.ncbi.nlm.nih.gov/28495311/",
        },
      },
    },
  ],
} as const satisfies DropContent;
