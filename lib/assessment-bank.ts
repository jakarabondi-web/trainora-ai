export type AssessmentQuestion = {
  id: string;
  section: "Core quality" | "Domain expertise";
  competency: string;
  prompt: string;
  options: string[];
  answer: number;
  weight: number;
};

export type AssessmentBlueprint = {
  discipline: string;
  title: string;
  durationMinutes: number;
  passScore: number;
  minimumDomainScore: number;
  questions: AssessmentQuestion[];
};

export const supportedDisciplines = [
  "Software Engineering",
  "Medicine",
  "Law",
  "Mathematics",
  "Finance",
  "Linguistics",
  "Research",
] as const;

export const coreQualityQuestions: AssessmentQuestion[] = [
  q("evidence-01", "Core quality", "Evidence discipline", "A model makes a plausible claim that is not supported by the supplied source. What is the correct action?", ["Accept it because it is likely true", "Flag it as unsupported and identify the missing evidence", "Rewrite it silently", "Skip the task"], 1, 2),
  q("rubric-01", "Core quality", "Rubric judgment", "Two rubric criteria appear to conflict. What should you do first?", ["Choose the stricter criterion without comment", "Use personal preference", "Escalate and cite the conflicting criteria", "Give both responses the same score"], 2, 2),
  q("security-01", "Core quality", "Data security", "Which action is a serious confidentiality violation?", ["Taking a scheduled break", "Using approved project references", "Pasting restricted task content into a public AI tool", "Requesting rubric clarification"], 2, 3),
  q("quality-01", "Core quality", "Instruction adherence", "A response is factually correct but fails a mandatory format instruction. How should it be treated?", ["Fully correct", "Non-compliant according to the rubric", "Correct it without recording the issue", "Approve it if the writing is good"], 1, 2),
  q("bias-01", "Core quality", "Fair evaluation", "A reviewer dislikes a culturally unfamiliar answer but cannot identify a rubric violation. What is the best next step?", ["Reject based on instinct", "Find objective evidence or escalate for domain review", "Lower the score slightly", "Copy another reviewer's score"], 1, 2),
  q("integrity-01", "Core quality", "Assessment integrity", "You recognize a hidden gold task from an earlier assessment. What should you do?", ["Share it with teammates", "Use memorized scoring notes", "Complete it independently and report the exposure concern", "Skip it without explanation"], 2, 3),
  q("safety-01", "Core quality", "Safety escalation", "A task contains content outside your approved safety clearance. What should you do?", ["Complete it quickly", "Download it for later", "Stop and use the project escalation channel", "Send it to another trainer"], 2, 3),
  q("uncertainty-01", "Core quality", "Calibration", "Evidence is insufficient to distinguish two ratings. A strong evaluator should:", ["Choose the higher rating", "State uncertainty and follow the rubric's escalation rule", "Average the ratings", "Use speed as a tie-breaker"], 1, 2),
];

const domainQuestions: Record<string, AssessmentQuestion[]> = {
  "Software Engineering": [
    q("swe-01", "Domain expertise", "Code correctness", "A function passes happy-path tests but fails for an empty input explicitly allowed by the specification. How should it be rated?", ["Fully correct", "Correct with a style issue", "Functionally incorrect because a required edge case fails", "Unrateable"], 2, 3),
    q("swe-02", "Domain expertise", "Security", "Which is the safest way to execute a database query containing user input?", ["String concatenation", "Parameterized queries", "Escaping quotes manually", "Base64 encoding"], 1, 3),
    q("swe-03", "Domain expertise", "Concurrency", "A shared counter is updated by multiple workers without synchronization. The primary risk is:", ["Dead-code elimination", "A race condition", "A memory leak only", "DNS poisoning"], 1, 2),
    q("swe-04", "Domain expertise", "Testing", "Which test best protects an API contract during a refactor?", ["Snapshot the entire repository", "Contract tests covering status, schema, and error behavior", "Only test the UI color", "Disable integration tests"], 1, 2),
    q("swe-05", "Domain expertise", "Maintainability", "Two implementations are equally correct. The stronger choice is generally the one that:", ["Uses more abstractions", "Is easiest to reason about and matches project conventions", "Has the fewest line breaks", "Uses the newest syntax"], 1, 2),
    q("swe-06", "Domain expertise", "Secure review", "A dependency introduces a known critical remote-code-execution vulnerability. What is the appropriate review result?", ["Approve if tests pass", "Block or escalate until mitigated", "Hide the warning", "Lower readability only"], 1, 3),
  ],
  Medicine: [
    q("med-01", "Domain expertise", "Clinical safety", "A model gives a definitive diagnosis despite missing vital history and examination data. The most important issue is:", ["Tone", "Unsafe overconfidence and missing differential reasoning", "Response length", "Spelling"], 1, 3),
    q("med-02", "Domain expertise", "Evidence hierarchy", "Which source generally provides the strongest evidence for an intervention when well conducted?", ["Anecdote", "Randomized controlled trial or systematic review", "Unreferenced blog", "Expert popularity poll"], 1, 2),
    q("med-03", "Domain expertise", "Triage", "A user reports new chest pressure, sweating, and shortness of breath. A safe response should prioritize:", ["Home remedies", "Urgent emergency assessment", "A routine appointment next month", "No action"], 1, 3),
    q("med-04", "Domain expertise", "Medication safety", "Before evaluating a dose recommendation, which context is essential?", ["Favorite color", "Age, renal/hepatic function, indication, and interactions", "Writing style", "Insurance carrier only"], 1, 3),
    q("med-05", "Domain expertise", "Privacy", "Protected patient data in a restricted task may be:", ["Copied into personal notes", "Shared only through approved project systems", "Posted to a public forum", "Sent to a personal email"], 1, 3),
    q("med-06", "Domain expertise", "Uncertainty", "When clinical evidence is ambiguous, the evaluator should:", ["Invent certainty", "Describe uncertainty and the evidence needed to resolve it", "Choose the commonest diagnosis without qualification", "Ignore contraindications"], 1, 2),
  ],
  Law: [
    q("law-01", "Domain expertise", "Jurisdiction", "Before evaluating a legal conclusion, the reviewer must first establish:", ["The writer's preferred outcome", "The governing jurisdiction and date", "The longest citation", "The client's industry only"], 1, 3),
    q("law-02", "Domain expertise", "Authority", "A binding appellate decision is generally stronger authority than:", ["A controlling statute", "A non-binding secondary blog post", "The constitution", "A later en banc decision"], 1, 2),
    q("law-03", "Domain expertise", "Citation validation", "A cited case does not support the proposition attributed to it. This is:", ["A formatting preference", "A material support and factuality defect", "Acceptable paraphrase", "Always harmless"], 1, 3),
    q("law-04", "Domain expertise", "Issue spotting", "A strong legal analysis should connect:", ["Facts, governing rules, application, and conclusion", "Only the conclusion and tone", "Only quotations", "Personal beliefs and policy"], 0, 2),
    q("law-05", "Domain expertise", "Professional limits", "When a prompt crosses into personalized legal advice outside scope, the evaluator should:", ["Provide a definitive answer", "Flag the limitation and follow escalation policy", "Guess the jurisdiction", "Remove all caveats"], 1, 3),
    q("law-06", "Domain expertise", "Confidentiality", "Confidential matter data should be processed:", ["In approved isolated systems only", "In any convenient AI tool", "Through personal cloud storage", "In a public chat"], 0, 3),
  ],
  Mathematics: [
    q("math-01", "Domain expertise", "Proof validity", "A proof reaches the correct conclusion using an unproved step equivalent to the result. The proof is:", ["Valid", "Circular and invalid", "Numerically approximate", "Complete by convention"], 1, 3),
    q("math-02", "Domain expertise", "Counterexamples", "To disprove a universal claim, it is sufficient to provide:", ["One valid counterexample", "Many supporting examples", "A diagram only", "A restatement"], 0, 2),
    q("math-03", "Domain expertise", "Algebra", "For real x, x² = 9 has solutions:", ["3 only", "-3 only", "±3", "No real solution"], 2, 2),
    q("math-04", "Domain expertise", "Probability", "If independent events A and B have probabilities .5 and .2, P(A∩B) is:", [".7", ".1", ".3", ".25"], 1, 2),
    q("math-05", "Domain expertise", "Numerical reasoning", "A claimed numerical answer conflicts with a symbolic derivation. The best review action is:", ["Prefer the longer one", "Recompute independently and locate the divergence", "Average them", "Approve both"], 1, 3),
    q("math-06", "Domain expertise", "Communication", "A rigorous solution should make assumptions and domain restrictions:", ["Implicit", "Explicit", "Optional when equations are present", "Secret"], 1, 2),
  ],
  Finance: [
    q("fin-01", "Domain expertise", "Financial statements", "An increase in accounts receivable, all else equal, usually affects operating cash flow by:", ["Increasing it", "Decreasing it", "Not affecting it", "Doubling revenue"], 1, 2),
    q("fin-02", "Domain expertise", "Valuation", "A higher discount rate generally produces:", ["A higher present value", "A lower present value", "No change", "Negative revenue"], 1, 2),
    q("fin-03", "Domain expertise", "Market claims", "A model attributes a price move to one event without evidence. The evaluator should:", ["Accept the narrative", "Flag unsupported causality", "Replace the event", "Ignore timing"], 1, 3),
    q("fin-04", "Domain expertise", "Regulatory awareness", "A recommendation involving securities should be evaluated with attention to:", ["Only grammar", "Jurisdiction, suitability, disclosures, and current rules", "Logo design", "Word count"], 1, 3),
    q("fin-05", "Domain expertise", "Risk", "Diversification primarily reduces:", ["All market risk", "Idiosyncratic concentration risk", "Inflation automatically", "Every possible loss"], 1, 2),
    q("fin-06", "Domain expertise", "Source quality", "For a public company's reported revenue, the preferred primary source is generally:", ["An anonymous post", "The company's filed financial statement", "A prediction market", "A forum summary"], 1, 2),
  ],
  Linguistics: [
    q("ling-01", "Domain expertise", "Meaning preservation", "A translation is fluent but reverses the source sentence's negation. It should be rated:", ["Fully correct", "Materially inaccurate", "Style-only issue", "Better than literal"], 1, 3),
    q("ling-02", "Domain expertise", "Register", "A formal legal notice translated into casual slang primarily fails:", ["Register and audience fit", "Token count", "Punctuation only", "Alphabet choice"], 0, 2),
    q("ling-03", "Domain expertise", "Localization", "A culturally specific idiom should generally be handled by:", ["Word-for-word substitution always", "Preserving intended meaning with an appropriate target-language expression", "Deleting it", "Leaving random source words"], 1, 2),
    q("ling-04", "Domain expertise", "Ambiguity", "When the source is genuinely ambiguous, the reviewer should:", ["Invent a single meaning", "Preserve or explicitly flag the ambiguity according to instructions", "Choose the shortest option", "Mark all translations wrong"], 1, 3),
    q("ling-05", "Domain expertise", "Grammar", "Subject–verb agreement is best evaluated as part of:", ["Grammatical well-formedness", "Factual sourcing", "Identity verification", "Encryption"], 0, 2),
    q("ling-06", "Domain expertise", "Bias and dialect", "A valid regional dialect should be penalized only when:", ["It differs from the reviewer's dialect", "It violates the specified locale, audience, or rubric", "It uses unfamiliar vocabulary", "Never under any conditions"], 1, 3),
  ],
  Research: [
    q("res-01", "Domain expertise", "Study design", "Random assignment primarily helps reduce:", ["Selection/confounding bias between study groups", "Publication formatting errors", "Sample size", "Measurement units"], 0, 3),
    q("res-02", "Domain expertise", "Causal inference", "A correlation alone establishes:", ["Causation", "Association, not necessarily causation", "Mechanism", "Generalizability"], 1, 3),
    q("res-03", "Domain expertise", "Reproducibility", "A reproducible analysis should preserve:", ["Only the final chart", "Data provenance, code, parameters, and environment details", "Personal memory", "Unlogged manual edits"], 1, 2),
    q("res-04", "Domain expertise", "Statistical interpretation", "A p-value does not by itself measure:", ["Compatibility with a null model", "Practical effect size or importance", "A test statistic", "Observed data"], 1, 2),
    q("res-05", "Domain expertise", "Source evaluation", "A strong literature review distinguishes:", ["Primary evidence, review evidence, and unsupported claims", "Long titles from short titles", "Only recent from old", "Popular from unpopular authors"], 0, 2),
    q("res-06", "Domain expertise", "Research ethics", "Sensitive participant data should be used according to:", ["Convenience", "Consent, protocol, minimization, and access controls", "Public-interest curiosity alone", "Personal preference"], 1, 3),
  ],
};

export function getAssessmentBlueprint(discipline: string): AssessmentBlueprint {
  const normalized = supportedDisciplines.find((item) => item.toLowerCase() === discipline.trim().toLowerCase()) ?? "Research";
  return {
    discipline: normalized,
    title: `Trainora ${normalized} Quality & Expertise`,
    durationMinutes: 35,
    passScore: 80,
    minimumDomainScore: 75,
    questions: [...coreQualityQuestions, ...domainQuestions[normalized]],
  };
}

function q(
  id: string,
  section: AssessmentQuestion["section"],
  competency: string,
  prompt: string,
  options: string[],
  answer: number,
  weight: number,
): AssessmentQuestion {
  return { id, section, competency, prompt, options, answer, weight };
}
