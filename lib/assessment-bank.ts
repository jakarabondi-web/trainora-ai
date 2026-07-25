export type AssessmentQuestion = {
  id: string;
  competency: string;
  prompt: string;
  options: string[];
  answer: number;
  weight: number;
};

export const coreQualityQuestions: AssessmentQuestion[] = [
  {
    id: "evidence-01",
    competency: "Evidence discipline",
    prompt: "A model makes a plausible financial claim that is not supported by the supplied source. What is the correct action?",
    options: ["Accept it because it is likely true", "Flag it as unsupported and identify the missing evidence", "Rewrite it silently", "Skip the task"],
    answer: 1,
    weight: 2,
  },
  {
    id: "rubric-01",
    competency: "Rubric judgment",
    prompt: "Two rubric criteria appear to conflict. What should you do first?",
    options: ["Choose the stricter criterion without comment", "Use personal preference", "Escalate and cite the conflicting criteria", "Give both responses the same score"],
    answer: 2,
    weight: 2,
  },
  {
    id: "security-01",
    competency: "Data security",
    prompt: "Which action is a serious confidentiality violation?",
    options: ["Taking a scheduled break", "Using approved project references", "Pasting restricted task content into a public AI tool", "Requesting rubric clarification"],
    answer: 2,
    weight: 3,
  },
  {
    id: "quality-01",
    competency: "Review quality",
    prompt: "A response is factually correct but fails a mandatory format instruction. How should it be treated?",
    options: ["Fully correct", "Partially or fully non-compliant according to the rubric", "Correct it without recording the issue", "Approve it if the writing is good"],
    answer: 1,
    weight: 2,
  },
  {
    id: "bias-01",
    competency: "Fair evaluation",
    prompt: "A reviewer disagrees with a culturally unfamiliar answer but cannot identify a rubric violation. What is the best next step?",
    options: ["Reject based on instinct", "Find objective evidence or escalate for domain review", "Lower the score slightly", "Ask another reviewer to copy the first score"],
    answer: 1,
    weight: 2,
  },
  {
    id: "integrity-01",
    competency: "Integrity",
    prompt: "You recognize a hidden gold task from an earlier assessment. What should you do?",
    options: ["Share it with teammates", "Answer using memorized scoring notes", "Complete it independently and report any exposure concern", "Skip it without explanation"],
    answer: 2,
    weight: 3,
  },
  {
    id: "safety-01",
    competency: "Safety escalation",
    prompt: "A task contains content outside your approved safety clearance. What should you do?",
    options: ["Complete it quickly", "Download it for later", "Stop and use the project escalation channel", "Send it to another trainer"],
    answer: 2,
    weight: 3,
  },
  {
    id: "uncertainty-01",
    competency: "Calibration",
    prompt: "When evidence is insufficient to distinguish two ratings, a strong evaluator should:",
    options: ["Choose the higher rating", "State uncertainty and follow the rubric's escalation rule", "Average the ratings", "Use task completion speed as a tie-breaker"],
    answer: 1,
    weight: 2,
  },
];

