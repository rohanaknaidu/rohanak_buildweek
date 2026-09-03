import type { DropContent } from "../registry";

export const mindPerceptionConstructed001 = {
  id: "mind-perception-constructed-001",
  topicId: "mind",
  areaId: "perception",
  title: "Your Brain Doesn't Show You the World Exactly as It Is",
  description:
    "A quick challenge about blind spots, peripheral vision, depth, expectation, and noticing.",
  status: "live",
  releaseAt: "2026-09-05T18:30:00.000Z",
  releaseOrder: 6,
  experience: {
    centralIdea:
      "Seeing feels direct, but visual experience is actively constructed from incomplete signals, context, and expectation.",
    exitUnderstanding:
      "Your visual world is not a camera feed; the brain fills gaps, infers structure, and prepares attention to decide what becomes experience.",
    visualIdentity: {
      family: "cognitive",
      motif: "neural-field",
      artwork: {
        hero: "mind-perception-field",
        reveal: "mind-perception-field",
      },
    },
  },
  questions: [
    {
      id: "blind-spot-filled",
      prompt: "What does your brain usually do with the blind spot in each eye?",
      options: [
        { id: "black-hole", label: "Leaves a small black hole in your vision" },
        { id: "fills-context", label: "Fills it in from surrounding visual information" },
        { id: "shuts-eye", label: "Briefly shuts that eye off" },
        { id: "copies-other-eye", label: "Copies a perfect image from the other eye" },
      ],
      correctOptionId: "fills-context",
      reveal: {
        discovery: "Your brain fills in a blind spot you usually never notice.",
        explanation:
          "Each eye has a blind spot where the optic nerve leaves the retina. You usually do not see a hole because the visual system fills in the missing region using nearby information and the other eye.",
        source: {
          label: "PMC Perceptual Filling-In Review",
          url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3119792/",
        },
      },
    },
    {
      id: "peripheral-detail-feels-rich",
      prompt:
        "When you stare at one word, what is true about the fine detail far from the center of your gaze?",
      options: [
        { id: "equally-sharp", label: "It is almost as sharp as the center" },
        { id: "less-detail", label: "It has less detail than it feels like it has" },
        { id: "more-detail", label: "It is sharper than the center" },
      ],
      correctOptionId: "less-detail",
      reveal: {
        discovery: "Peripheral vision feels richer than it actually is.",
        explanation:
          "Peripheral vision is useful for awareness and motion, but fine detail is concentrated near the center of gaze. The visual field often feels more detailed than the information available in the periphery.",
        source: {
          label: "Annual Review of Vision Science",
          url: "https://www.annualreviews.org/content/journals/10.1146/annurev-vision-082114-035733",
        },
      },
    },
    {
      id: "visual-crowding",
      prompt:
        "Why can a letter be harder to identify when other letters are packed close around it?",
      options: [
        { id: "light-stops", label: "The eye stops receiving light from the letter" },
        { id: "nearby-interfere", label: "Nearby shapes interfere with recognition" },
        { id: "letter-shrinks", label: "The letter physically becomes smaller" },
        { id: "color-off", label: "Color vision briefly switches off" },
      ],
      correctOptionId: "nearby-interfere",
      reveal: {
        discovery: "Clutter can make visible objects harder to recognize.",
        explanation:
          "Visual crowding happens when nearby objects interfere with recognizing a target, especially outside central vision. The target can be visible but still hard to identify.",
        source: {
          label: "Nature Reviews Neuroscience Crowding",
          url: "https://www.nature.com/articles/nrn.2016.73",
        },
      },
    },
    {
      id: "depth-from-flat-retinas",
      prompt:
        "Your retinas receive flat images. How does your brain usually judge depth?",
      options: [
        { id: "single-distance-sensor", label: "By directly measuring distance with each eye" },
        { id: "scene-cues", label: "By combining cues from both eyes, motion, and the scene" },
        { id: "brightness-only", label: "By treating brighter objects as closer" },
      ],
      correctOptionId: "scene-cues",
      reveal: {
        discovery: "Depth is inferred from clues, not captured like a 3D scan.",
        explanation:
          "The brain estimates depth using several cues, including the slightly different views from the two eyes, movement, size, overlap, and perspective. Depth perception is an inference built from evidence.",
        source: {
          label: "NCBI Webvision Depth Perception",
          url: "https://www.ncbi.nlm.nih.gov/books/NBK11512/",
        },
      },
    },
    {
      id: "expectation-shapes-perception",
      prompt:
        "If an image is unclear, what can your expectations do to what you perceive?",
      options: [
        { id: "bias-interpretation", label: "Bias how the image is interpreted" },
        { id: "no-effect", label: "Have no effect until after you recognize it" },
        { id: "replace-eyes", label: "Replace input from the eyes entirely" },
      ],
      correctOptionId: "bias-interpretation",
      reveal: {
        discovery: "What you expect can shape what you perceive.",
        explanation:
          "Perception combines incoming sensory information with prior knowledge and expectation. Expectations can bias interpretation, especially when the signal is ambiguous, without making perception arbitrary.",
        source: {
          label: "Nature Reviews Neuroscience Predictive Perception",
          url: "https://www.nature.com/articles/nrn.2016.26",
        },
      },
    },
    {
      id: "seeing-needs-attention",
      prompt:
        "If something sends light into your eyes, does that guarantee you consciously notice it?",
      options: [
        { id: "yes", label: "Yes - visible input always becomes conscious experience" },
        { id: "no-attention", label: "No - attention still helps determine what you notice" },
      ],
      correctOptionId: "no-attention",
      reveal: {
        discovery: "Seeing starts with the eyes, but noticing depends on attention.",
        explanation:
          "Visual input can reach the eyes without becoming something you consciously notice. Attention strongly shapes which parts of the visual world enter awareness.",
        source: {
          label: "PubMed Inattentional Blindness",
          url: "https://pubmed.ncbi.nlm.nih.gov/10694957/",
        },
      },
    },
  ],
} as const satisfies DropContent;
